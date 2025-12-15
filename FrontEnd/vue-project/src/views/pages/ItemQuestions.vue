<template>
    <div class="container">
        <h1>Questions for Item {{ itemId }}</h1>
        
        <div v-if="item">
            <h2>{{ item.name }}</h2>
            <p>{{ item.description }}</p>
        </div>

        <div v-if="loading">
            <em>Loading questions...</em>
        </div>

        <div v-if="questions.length > 0">
            <h3>Questions</h3>
            <div v-for="question in questions" :key="question.question_id" :class="question.answer_text ? 'question-card answered' : 'question-card'">
                <strong>Q:</strong> {{ question.question_text }}
                <br />
                <em>Asked by {{ question.first_name }} {{ question.last_name }} (ID: {{ question.asked_by }})</em>
                <div v-if="question.answer_text">
                    <br />
                    <strong>A:</strong> {{ question.answer_text }}
                </div>
                <div v-else-if="isItemOwner">
                    <br />
                    <em>Not answered yet</em>
                    <br />
                    <div v-if="answeringQuestionId === question.question_id">
                        <textarea v-model="answerText" rows="3" placeholder="Type your answer..."></textarea>
                        <br />
                        <button @click="submitAnswer(question.question_id)">Submit Answer</button>
                        <button @click="cancelAnswer">Cancel</button>
                    </div>
                    <div v-else>
                        <button @click="startAnswering(question.question_id)">Answer Question</button>
                    </div>
                </div>
                <div v-else>
                    <br />
                    <em>Not answered yet</em>
                </div>
                <p v-if="answerError && answeringQuestionId === question.question_id" class="error-text">{{ answerError }}</p>
            </div>
        </div>
        <div v-else-if="!loading">
            <p>No questions yet.</p>
        </div>

        <div v-if="isLoggedIn">
            <h3>Ask a Question</h3>
            <form @submit.prevent="handleAskQuestion">
                <div>
                    <label>Your Question:</label><br />
                    <textarea v-model="questionText" rows="4" required></textarea>
                </div>
                <br />
                <button type="submit">Submit Question</button>
            </form>
            <p v-if="questionSuccess" class="success-message">Question submitted successfully!</p>
            <p v-if="questionError" class="error-text">{{ questionError }}</p>
        </div>
        <div v-else>
            <p><em>Please log in to ask a question.</em></p>
        </div>

        <br />
        <button @click="goBack">Back to Item</button>

        <div v-if="error" class="error-text">
            <strong>Error:</strong> {{ error }}
        </div>
    </div>
</template>

<script>
import { coreServices } from '../../services/core.services.js';

export default {
    data() {
        return {
            itemId: null,
            item: null,
            questions: [],
            loading: false,
            error: null,
            questionText: '',
            questionSuccess: false,
            questionError: null,
            answeringQuestionId: null,
            answerText: '',
            answerError: null
        }
    },

    computed: {
        isLoggedIn() {
            return localStorage.getItem('session_token') !== null;
        },
        isItemOwner() {
            return this.isLoggedIn && this.item && this.item.creator_id === parseInt(localStorage.getItem('user_id'), 10);
        }
    },

    mounted() {
        this.itemId = parseInt(this.$route.params.itemId, 10);
        this.loadItemAndQuestions();
    },

    methods: {
        async loadItemAndQuestions() {
            this.loading = true;
            this.error = null;

            try {
                this.item = await coreServices.getItemById(this.itemId);
                this.questions = await coreServices.getQuestions(this.itemId);
                this.loading = false;
            } catch (error) {
                this.error = error;
                this.loading = false;
                this.$router.push({ path: '/questions', query: { error: error } });
            }
        },

        async handleAskQuestion() {
            this.questionError = null;
            this.questionSuccess = false;

            if (!this.questionText.trim()) {
                this.questionError = 'Please enter a question';
                return;
            }

            try {
                await coreServices.askQuestion(this.itemId, this.questionText);
                this.questionSuccess = true;
                this.questionText = '';
                await this.loadItemAndQuestions();
            } catch (error) {
                this.questionError = error;
            }
        },

        startAnswering(questionId) {
            this.answeringQuestionId = questionId;
            this.answerText = '';
            this.answerError = null;
        },

        cancelAnswer() {
            this.answeringQuestionId = null;
            this.answerText = '';
            this.answerError = null;
        },

        async submitAnswer(questionId) {
            this.answerError = null;

            if (!this.answerText.trim()) {
                this.answerError = 'Please enter an answer';
                return;
            }

            try {
                await coreServices.answerQuestion(questionId, this.answerText);
                this.answeringQuestionId = null;
                this.answerText = '';
                await this.loadItemAndQuestions();
            } catch (error) {
                this.answerError = error;
            }
        },

        formatDate(timestamp) {
            if (!timestamp) return 'N/A';
            return new Date(timestamp).toLocaleString();
        },

        goBack() {
            this.$router.push('/get-item');
        }
    }
}
</script>

<style scoped>
</style>
