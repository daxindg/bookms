<template>
    <form class="search-box" :class="{ expand: expand }" @submit.prevent>
        <input
            type="text"
            name=""
            class="search-txt"
            placeholder="Type to search"
            :value="searchText"
            @input="$emit('update:search-text', $event.target.value)"
            ref="search"
            @focusin="onFocusin"
            @focusout="onFocusout"
        />
        <slot></slot>
        <span class="search-btn" href="#" @click="$emit('submit')">
            <svg
                focusable="false"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                class="svg-search"
                width="20"
                fill="orangered"
            >
                <path
                    d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                ></path>
            </svg>
        </span>
    </form>
</template>

<script>
export default {
    name: "CollapseSearchBox",
    props: {
        searchText: String,
    },
    data() {
        return {
            hasFocus: false,
        };
    },
    computed: {
        expand() {
            return (
                (this.searchText && this.searchText.length > 0) || this.hasFocus
            );
        },
    },
    methods: {
        onFocusin() {
            this.hasFocus = true;
            this.$emit('focusin', true);
        },
        onFocusout() {
            this.hasFocus = false;
        },
    },
};
</script>


<style scoped>
.search-box {
    /* transform: translate(-50%, -50%); */
    /* display: inline-flex;
    align-items: center; */
    /* background: #2f3640; */
    position: relative;
    height: 15px;
    border-radius: 20px;
    padding: 7px;
    margin: 5px;
}

.search-box:hover > .search-txt,
.search-box.expand .search-txt {
    width: 140px;
    /* padding: 0 6px; */
}

.search-box:hover,
.search-box.expand {
    box-shadow: 0 1px 6px 0 rgba(32, 33, 36, 0.28);
}

.search-btn {
    color: orangered;
    position: absolute;
    top: 5px;
    right: 3px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    /* background: #2f3640; */

    display: flex;
    justify-content: center;
    align-items: center;
    transition: 0.4s;
}

.search-txt {
    border: none;
    background: none;
    outline: none;
    /* float: left; */
    padding-left: 0.3em;
    /* color: white; */
    font-size: 16px;
    transition: 0.4s;
    /* line-height: 40px; */
    width: 0;
}
</style>