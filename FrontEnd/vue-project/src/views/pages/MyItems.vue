<template>
    <div class="container">
        <h1>My Items</h1>
        
        <p v-if="!isLoggedIn"><em>Please log in to view your items.</em></p>
        
        <div v-else>
            <div v-if="loading">
                <em>Loading your items...</em>
            </div>

            <div v-if="myItems.length > 0">
                <h2>Items I Created</h2>
                <div v-for="item in myItems" :key="item.item_id" class="item-card">
                    <h3>{{ item.name }}</h3>
                    <p><strong>Item ID:</strong> {{ item.item_id }}</p>
                    <p>{{ item.description }}</p>
                    <p>
                        <strong>Starting Bid:</strong> {{ item.starting_bid ? '£' + item.starting_bid : 'N/A' }}
                        <br />
                        <strong>Current Bid:</strong> {{ item.current_bid ? '£' + item.current_bid : 'No bids' }}
                        <br />
                        <strong>Ends:</strong> {{ new Date(item.end_date).toLocaleString() }}
                    </p>
                    
                    <button @click="viewItemBids(item.item_id)">
                        {{ selectedItemId === item.item_id ? 'Hide Bids' : 'View Bids' }}
                    </button>
                    
                    <div v-if="selectedItemId === item.item_id && bids.length > 0">
                        <h4>Bids for {{ item.name }}</h4>
                        <div v-for="bid in bids" :key="bid.bid_id" class="bid-card">
                            <strong>£{{ bid.amount }}</strong> - by {{ bid.first_name }} {{ bid.last_name }} (ID: {{ bid.bidder_id }})
                            <br />
                            <em>{{ new Date(bid.timestamp).toLocaleString() }}</em>
                        </div>
                    </div>
                    <div v-else-if="selectedItemId === item.item_id && bids.length === 0">
                        <p><em>No bids yet for this item.</em></p>
                    </div>

                    <div v-if="getUnansweredQuestions(item.item_id).length > 0">
                        <h4>Unanswered Questions ({{ getUnansweredQuestions(item.item_id).length }})</h4>
                        <div v-for="question in getUnansweredQuestions(item.item_id)" :key="question.question_id" class="question-card">
                            <strong>Q:</strong> {{ question.question_text }}
                            <br />
                            <em>Asked by {{ question.first_name }} {{ question.last_name }}</em>
                            <br />
                            <div v-if="answeringQuestionId === question.question_id">
                                <textarea v-model="answerText" rows="3" placeholder="Type your answer..."></textarea>
                                <br />
                                <button @click="submitAnswer(question.question_id)">Submit Answer</button>
                                <button @click="cancelAnswer">Cancel</button>
                                <p v-if="answerError" class="error-text">{{ answerError }}</p>
                            </div>
                            <div v-else>
                                <button @click="startAnswering(question.question_id)">Answer</button>
                            </div>
                        </div>
                    </div>

                    <div v-if="getAnsweredQuestions(item.item_id).length > 0">
                        <h4>Answered Questions ({{ getAnsweredQuestions(item.item_id).length }})</h4>
                        <div v-for="question in getAnsweredQuestions(item.item_id)" :key="question.question_id" class="question-card answered">
                            <strong>Q:</strong> {{ question.question_text }}
                            <br />
                            <em>Asked by {{ question.first_name }} {{ question.last_name }}</em>
                            <br />
                            <strong>A:</strong> {{ question.answer_text }}
                        </div>
                    </div>
                </div>
            </div>
            <div v-else-if="!loading">
                <p>You haven't created any items yet.</p>
            </div>

            <div v-if="error" class="error-text">
                <strong>Error:</strong> {{ error }}
            </div>
        </div>
    </div>
</template>

<script>
import { coreServices } from '../../services/core.services.js';

export default {
    data() {
        return {
            myItems: [],
            bids: [],
            questions: {},
            loading: false,
            error: null,
            selectedItemId: null,
            answeringQuestionId: null,
            answerText: '',
            answerError: null
        }
    },

    computed: {
        isLoggedIn() {
            return !!localStorage.getItem('session_token');
        }
    },

    mounted() {
        if (this.isLoggedIn) {
            this.loadMyItems();
        }
    },

    methods: {
        async loadMyItems() {
            this.loading = true;
            this.error = null;

            try {
                const searchResults = await coreServices.searchItem({ status: 'OPEN' });
                
                this.myItems = [];
                for (const result of searchResults) {
                    const fullItem = await coreServices.getItemById(result.item_id);
                    this.myItems.push(fullItem);
                    
                    const itemQuestions = await coreServices.getQuestions(result.item_id);
                    this.questions[result.item_id] = itemQuestions;
                }
                
                this.loading = false;
            } catch (error) {
                this.error = error;
                this.loading = false;
            }
        },

        getUnansweredQuestions(itemId) {
            const itemQuestions = this.questions[itemId] || [];
            return itemQuestions.filter(q => !q.answer_text);
        },

        getAnsweredQuestions(itemId) {
            const itemQuestions = this.questions[itemId] || [];
            return itemQuestions.filter(q => q.answer_text);
        },

        async viewItemBids(itemId) {
            if (this.selectedItemId === itemId) {
                this.selectedItemId = null;
                this.bids = [];
                return;
            }

            this.selectedItemId = itemId;
            this.error = null;

            try {
                this.bids = await coreServices.getBids(itemId);
            } catch (error) {
                this.error = error;
                this.bids = [];
            }
        },

        viewQuestions(itemId) {
            this.$router.push(`/item/${itemId}/questions`);
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
                await this.loadMyItems();
            } catch (error) {
                this.answerError = error;
            }
        }
    }
}
</script>

<style scoped>
</style>
