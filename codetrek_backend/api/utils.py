# api/utils.py

import chromadb
import requests
import pandas as pd
from django.conf import settings
from fuzzywuzzy import process

import os

class ChromaDBManager:
    def __init__(self):
        self.client = chromadb.PersistentClient(path=settings.CHROMADB_PATH)
        self.collection = self.client.get_or_create_collection(
            name=settings.CHROMADB_COLLECTION_NAME
        )
    
    def query_concept(self, query_text, n_results=1):
        results = self.collection.query(
            query_texts=[query_text],
            n_results=n_results
        )
        if results["documents"] and results["documents"][0]:
            return results["documents"][0][0]
        return ""

class OllamaClient:
    @staticmethod
    def generate_response(prompt):
        try:
            response = requests.post(
                settings.OLLAMA_API_URL,
                json={
                    "model": settings.MODEL_NAME,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
            "temperature": 0.7,
            "top_p": 0.9,
            "num_predict": 300,
            "max_tokens" : 1500
            }
                },timeout=180
            )
            if response.status_code == 200:
                return response.json().get("response", "No valid response from model.")
            return f"Error: API returned status code {response.status_code}"
        except Exception as e:
            return f"Error connecting to Ollama API: {str(e)}"
    
    @staticmethod
    def get_concept_explanation(query, retrieved_concept=""):
        prompt = f"""
        You are a competitive programming tutor. Use the following retrieved concept to provide a better answer.
        **User Query:** {query}
        **Retrieved Concept:** {retrieved_concept if retrieved_concept else 'No relevant concept found in ChromaDB.'}
        Please provide a detailed explanation only if words like "Explain","in detail"
 are there if not provide short explanations and list the sub headings with a one,two line explainantion        """
        return OllamaClient.generate_response(prompt)
    
    @staticmethod
    def guide_user_through_question(title, description):
        guide_prompt = f"""
                            You are an expert competitive programming tutor helping a student understand a coding problem.

                            📌 **Problem Title:** {title}

                            📄 **Problem Description:**
                            {description}

                            🧠 Your task is to help the student by:
                            - List out the core concepts involved in solving the problem.
                            
                            - Giving 2-3 progressive hints to guide their thinking.
                            🚫 **DO NOT** write or suggest the code. Only provide strategic guidance.
                            - make sure the respone is short

                            ✍️ Keep your tone friendly, clear, and focused on learning.
                            """
        return OllamaClient.generate_response(guide_prompt)

    
    
    
    @staticmethod
    def evaluate_code(problem_title, problem_description, user_code):
        eval_prompt = f"""
        **Problem:** {problem_title}
        **Description:** {problem_description}
        **User's Code:**
        ```
        {user_code}
        ```
        📌 **Evaluation Criteria:**
- **Correctness:** Verify that the solution solves the problem as described.
- **Efficiency:** Evaluate the time and space complexity of the user's code.
- **Edge Cases:** Identify potential edge cases and how well the code handles them.
  
📝 **Feedback:**
- Assess the time and space complexity of the code. Mention the user's code's time and space complexity.
- Provide concise and constructive feedback on how the code could be improved, without providing the actual solution.
- Focus on **optimization** suggestions and **possible pitfalls**.

- make sure the response is short and consise
  
⚠️ **Note:** Do not provide any code directly.
        """
        return OllamaClient.generate_response(eval_prompt)

class DatasetManager:
    def __init__(self, dataset_path=None):
        if dataset_path is None:
            dataset_path = os.path.join(settings.BASE_DIR, 'api', 'leetcode_dataset - lc.csv')
        try:
            self.df = pd.read_csv(dataset_path)
        except Exception as e:
            print(f"Error loading dataset: {str(e)}")
            self.df = pd.DataFrame(columns=[
                'title', 'description', 'difficulty', 'related_topics'
            ])

    def get_best_matching_topic(self, user_topic):
        if self.df.empty or 'related_topics' not in self.df.columns:
            return None
        
        all_topics = self.df['related_topics'].dropna().unique()
        if not all_topics.size:
            return None
            
        best_match, score = process.extractOne(user_topic.lower(), all_topics)
        return best_match if score > 60 else None
    
    def get_question_from_dataset(self, topic, difficulty):
        matched_topic = self.get_best_matching_topic(topic.lower())
        if not matched_topic:
            return None
        
        filtered_df = self.df[
            (self.df['related_topics'] == matched_topic) &
            (self.df['difficulty'].str.lower() == difficulty.lower())
        ]
        
        if filtered_df.empty:
            return None
        
        return filtered_df.sample(n=1).iloc[0].to_dict()
