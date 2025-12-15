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
            <select name="status" v-model="status">
                <option value="">All</option>
                <option value="BID">Bid</option>
                <option value="OPEN">Open</option>
                <option value="ARCHIVE">Archive</option>
            </select>

            <br /><br />

            <button>Search</button>
        </form>

        <div v-if="searchResults.length > 0">
            <h3>Search Results ({{ searchResults.length }} items)</h3>
            <ul>
                <li v-for="item in searchResults" :key="item.item_id">
                    <strong>{{ item.name }}</strong> (ID: {{ item.item_id }})
                    <br />
                    {{ item.description }}
                    <br />
                    <em>Created by: {{ item.first_name }} {{ item.last_name }}</em>
                    <br />
                    <em>Ends: {{ new Date(item.end_date).toLocaleString() }}</em>
                </li>
            </ul>
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
            }
        },

        methods: {
            async handleSearch() {
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
            }
        }
    }   

    


  

</script>

<style scoped>

</style>

