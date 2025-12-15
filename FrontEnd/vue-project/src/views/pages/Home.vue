<template>
    <div class="container">
        <h1>Home Page</h1>
        <p>Welcome to the Auctionary application!</p>
    
        <br/> <br/>
        
        <h2>Search Item</h2>
        <form @submit.prevent="handleSearch">
            <label for="query">Search Query: </label>
            <input type="text" name="query" v-model="query"/>

            <br /><br />

            <label for="status">Status: </label>
            <select id="statusFilter" v-model="status">
                <option value="">All</option>
                <option value="BID">Bid</option>
                <option value="OPEN">Open</option>
                <option value="ARCHIVE">Archive</option>
            </select>

            <br /><br />

            <button>Search</button>
        </form>

        <p v-if="statusError" class="error-text">{{ statusError }}</p>

        <div v-if="searchResults.length > 0">
            <h3>Search Results ({{ searchResults.length }} items)</h3>
            <div v-for="item in searchResults" :key="item.item_id" class="item-card">
                <h3>{{ item.name }}</h3>
                <p><strong>Item ID:</strong> {{ item.item_id }}</p>
                <p>{{ item.description }}</p>
                <p>
                    <strong>Created by:</strong> {{ item.first_name }} {{ item.last_name }}
                    <br />
                    <strong>Ends:</strong> {{ new Date(item.end_date).toLocaleString() }}
                </p>
                <button @click="viewItem(item.item_id)">View & Bid</button>
                <button @click="viewQuestions(item.item_id)">Questions</button>
            </div>
        </div>

        <div v-else-if="searched">
            <p>No items found.</p>
        </div>
    </div>
    
</template>

<script>
import { coreServices } from '../../services/core.services.js';
    export default {
        data() {
            return {
                query: "",
                status: "",
                searchResults: [],
                searched: false,
                statusError: null
            }
        },

        computed: {
            isLoggedIn() {
                return localStorage.getItem('session_token') !== null;
            }
        },

        methods: {
            async handleSearch() {
                this.statusError = null;
                
                if (this.status && !this.isLoggedIn) {
                    this.statusError = "You must be logged in to use status filters (BID, OPEN, ARCHIVE).";
                    this.searchResults = [];
                    this.searched = false;
                    return;
                }
                
                try {
                    const queryParams = {};
                    if (this.query) queryParams.q = this.query;
                    if (this.status) queryParams.status = this.status;
                    
                    const response = await coreServices.searchItem(queryParams);
                    console.log("Search Results:", response);
                    this.searchResults = response;
                    this.searched = true;
                } catch (error) {
                    console.error("Error during search:", error);
                    alert("An error occurred while searching. Please try again.");
                    this.searchResults = [];
                    this.searched = false;
                }
            },

            viewItem(itemId) {
                sessionStorage.setItem('currentItemId', itemId);
                this.$router.push('/get-item');
            },

            viewQuestions(itemId) {
                this.$router.push(`/item/${itemId}/questions`);
            }
        }
    }   

    


  

</script>

<style scoped>

</style>

