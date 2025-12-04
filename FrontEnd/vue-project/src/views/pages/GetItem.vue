
<template>
    <div class="container">
        <h1>Item Details</h1>
        
        <div class="input-group">
            <label>Item ID:</label>
            <input v-model.number="itemId" type="number" min="1" @keyup.enter="fetchItem" />
            <button @click="fetchItem">Load Item</button>
        </div>

        <em v-if="loading">Loading item...</em>
        
        <div v-if="item" class="item-details">
            <h2>{{ item.name }}</h2>
            <div class="info-grid">
                <div><strong>Item ID:</strong> {{ item.item_id }}</div>
                <div><strong>Starting Bid:</strong> ${{ item.starting_bid }}</div>
                <div><strong>Current Bid:</strong> ${{ item.current_bid }}</div>
                <div><strong>Start Date:</strong> {{ formatDate(item.start_date) }}</div>
                <div><strong>End Date:</strong> {{ formatDate(item.end_date) }}</div>
                <div><strong>Creator:</strong> {{ item.first_name }} {{ item.last_name }} (ID: {{ item.creator_id }})</div>
            </div>
            
            <div class="description">
                <strong>Description:</strong>
                <p>{{ item.description }}</p>
            </div>

            <div v-if="item.current_bid_holder" class="bid-holder">
                <strong>Current Bid Holder:</strong>
                <p>{{ item.current_bid_holder.first_name }} {{ item.current_bid_holder.last_name }} (ID: {{ item.current_bid_holder.user_id }})</p>
            </div>
            <div v-else class="no-bids">
                <p>No bids yet</p>
            </div>
        </div>
        
        <div v-if="error" class="error">
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
                itemId: 1,
                loading: false,
                error: null
            }
        },

        mounted() {
            this.fetchItem();
        },

        methods: {
            fetchItem() {
                this.loading = true;
                this.error = null;
                
                coreServices.getItemById(this.itemId)
                    .then(item => {
                        this.item = item;
                        this.loading = false;
                    })
                    .catch(error => {
                        this.error = error;
                        this.loading = false;
                    });
            },

            formatDate(timestamp) {
                if (!timestamp) return 'N/A';
                return new Date(timestamp).toLocaleString();
            }
        }
    }
</script>


<style scoped>
/* All styles now in global-styles.css */
</style>

