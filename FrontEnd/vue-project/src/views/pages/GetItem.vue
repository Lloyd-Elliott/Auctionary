
<template>
    <div class="container">
        <h1>Item Details</h1>
        
        <div>
            <label>Item ID:</label>
            <input v-model.number="itemId" type="number" min="1"/>
            <button @click="fetchItem">Load Item</button>
        </div>

        <em v-if="loading">Loading item...</em>
        
        <p v-if="!item && !loading && !error">Please enter an item ID and click "Load Item" to view details.</p>
        
        <div v-if="item" class="item-card">
            <h2>{{ item.name }}</h2>
            <p><strong>Item ID:</strong> {{ item.item_id }}</p>
            <p><strong>Description:</strong> {{ item.description }}</p>
            <p>
                <strong>Starting Bid:</strong> £{{ item.starting_bid }}
                <br />
                <strong>Current Bid:</strong> £{{ item.current_bid }}
                <br />
                <strong>Start Date:</strong> {{ formatDate(item.start_date) }}
                <br />
                <strong>End Date:</strong> {{ formatDate(item.end_date) }}
                <br />
                <strong>Creator:</strong> {{ item.first_name }} {{ item.last_name }} (ID: {{ item.creator_id }})
            </p>

            <div v-if="item.current_bid_holder">
                <strong>Current Bid Holder:</strong>
                <p>{{ item.current_bid_holder.first_name }} {{ item.current_bid_holder.last_name }} (ID: {{ item.current_bid_holder.user_id }})</p>
            </div>
            <div v-else>
                <p><em>No bids yet</em></p>
            </div>

            <div v-if="isLoggedIn && item.creator_id !== currentUserId && !isCurrentBidHolder">
                <h3>Place a Bid</h3>
                <div>
                    <label>Bid Amount (£):</label>
                    <input v-model.number="bidAmount" type="number" min="1" step="0.01" />
                    <button @click="handlePlaceBid">Place Bid</button>
                </div>
                <p v-if="bidSuccess" class="success-message">Bid placed successfully!</p>
                <p v-if="bidError" class="error-text">{{ bidError }}</p>
            </div>
            <div v-else-if="isLoggedIn && item.creator_id === currentUserId">
                <p><em>You cannot bid on your own item.</em></p>
            </div>
            <div v-else-if="isLoggedIn && isCurrentBidHolder">
                <p><em>You are the current highest bidder.</em></p>
            </div>
            <div v-else>
                <p><em>Please log in to place a bid.</em></p>
            </div>

            <div>
                <h3>Questions</h3>
                <button @click="viewQuestions">View Questions</button>
            </div>
        </div>
        
        <div v-if="error">
            <strong>Error:</strong> {{ error }}
        </div>
    </div>
</template>

<script>
    import { coreServices } from '../../services/core.services.js';
    
    export default {
        data() {
            return {
                item: null,
                itemId: null,
                loading: false,
                error: null,
                bidAmount: null,
                bidSuccess: false,
                bidError: null
            }
        },

        mounted() {
            const savedItemId = sessionStorage.getItem('currentItemId');
            if (savedItemId) {
                this.itemId = parseInt(savedItemId, 10);
                this.fetchItem();
            }
        },

        beforeUnmount() {
            sessionStorage.removeItem('currentItemId');
        },

        computed: {
            isLoggedIn() {
                return localStorage.getItem('session_token') !== null;
            },
            currentUserId() {
                return parseInt(localStorage.getItem('user_id'), 10);
            },
            isCurrentBidHolder() {
                return this.item && 
                       this.item.current_bid_holder && 
                       this.item.current_bid_holder.user_id === this.currentUserId;
            }
        },

        methods: {
            fetchItem() {
                this.loading = true;
                this.error = null;
                this.item = null;
                this.bidSuccess = false;
                this.bidError = null;
                
                sessionStorage.setItem('currentItemId', this.itemId);
                
                coreServices.getItemById(this.itemId)
                    .then(item => {
                        this.item = item;
                        this.loading = false;
                        this.bidAmount = (item.current_bid || item.starting_bid) + 1;
                    })
                    .catch(error => {
                        this.error = error;
                        this.loading = false;
                    });
            },

            handlePlaceBid() {
                if (!this.bidAmount || this.bidAmount <= 0) {
                    this.bidError = 'Please enter a valid bid amount';
                    return;
                }

                this.bidError = null;
                this.bidSuccess = false;

                coreServices.placeBid(this.itemId, this.bidAmount)
                    .then(() => {
                        this.bidSuccess = true;
                        this.bidError = null;
                        return coreServices.getItemById(this.itemId);
                    })
                    .then(item => {
                        this.item = item;
                        this.bidAmount = (item.current_bid || item.starting_bid) + 1;
                    })
                    .catch(error => {
                        this.bidError = error;
                        this.bidSuccess = false;
                    });
            },

            formatDate(timestamp) {
                if (!timestamp) return 'N/A';
                return new Date(timestamp).toLocaleString();
            },

            viewQuestions() {
                this.$router.push(`/item/${this.itemId}/questions`);
            }
        }
    }
</script>


<style scoped>
</style>

