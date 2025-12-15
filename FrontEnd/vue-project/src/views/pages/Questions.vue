<template>
    <div class="container">
        <h1>Questions</h1>
        <p>Enter an item ID to view or ask questions about that item.</p>

        <form @submit.prevent="viewQuestions">
            <label for="itemId">Item ID:</label>
            <input id="itemId" v-model.number="itemId" type="number" min="1" required />
            <button type="submit">View Questions</button>
        </form>

        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
    </div>
</template>

<script>
export default {
    data() {
        return {
            itemId: null,
            errorMessage: null
        }
    },

    mounted() {
        if (this.$route.query.error) {
            this.errorMessage = this.$route.query.error;
        }
    },

    methods: {
        viewQuestions() {
            this.errorMessage = null;
            if (this.itemId) {
                this.$router.push(`/item/${this.itemId}/questions`);
            }
        }
    }
}
</script>

<style scoped>
</style>
