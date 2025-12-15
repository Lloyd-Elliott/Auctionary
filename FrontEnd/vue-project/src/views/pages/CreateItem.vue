<template>
    <div class="container">
        <h1>Create New Auction Item</h1>
        
        <div v-if="!isLoggedIn" class="error-message">
            <p>You must be logged in to create an item.</p>
            <router-link to="/login">Login here</router-link>
        </div>

        <form v-else @submit.prevent="handleCreateItem">
            <div>
                <label for="name">Item Name:</label><br />
                <input type="text" id="name" v-model="formData.name" required />
            </div>

            <br />

            <div>
                <label for="description">Description:</label><br />
                <textarea id="description" v-model="formData.description" rows="4" required></textarea>
            </div>

            <br />

            <div>
                <label for="starting_bid">Starting Bid ($):</label><br />
                <input type="number" id="starting_bid" v-model.number="formData.starting_bid" min="1" required />
            </div>

            <br />

            <div>
                <label for="end_date">End Date:</label><br />
                <input type="datetime-local" id="end_date" v-model="formData.end_date" required />
            </div>

            <br />

            <button type="submit">Create Item</button>
        </form>

        <div v-if="error" class="error-message">
            <strong>Error:</strong> {{ error }}
        </div>

        <div v-if="success" class="success-message">
            <strong>Success!</strong> Item created with ID: {{ createdItemId }}
            <br />
            <router-link :to="`/get-item?id=${createdItemId}`">View item</router-link>
        </div>
    </div>
</template>

<script>
import { coreServices } from '../../services/core.services.js';

export default {
    data() {
        return {
            formData: {
                name: '',
                description: '',
                starting_bid: 1,
                end_date: ''
            },
            error: null,
            success: false,
            createdItemId: null
        }
    },
    computed: {
        isLoggedIn() {
            return !!localStorage.getItem('session_token');
        }
    },
    methods: {
        async handleCreateItem() {
            this.error = null;
            this.success = false;

            try {
                const itemData = {
                    name: this.formData.name,
                    description: this.formData.description,
                    starting_bid: this.formData.starting_bid,
                    end_date: new Date(this.formData.end_date).toISOString()
                };

                const response = await coreServices.createItem(itemData);
                console.log('Item created:', response);
                this.success = true;
                this.createdItemId = response.item_id;
                
                this.formData = {
                    name: '',
                    description: '',
                    starting_bid: 1,
                    end_date: ''
                };
            } catch (error) {
                console.error('Create item error:', error);
                this.error = error;
            }
        }
    }
}
</script>

<style scoped>

</style>
