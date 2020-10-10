<template>
    <form
        class="search-form"
        @submit.stop.prevent="$emit('submit-search', searchText)"
    >
        <div class="search-input-wrapper">
            <label class="search-label" for="stext">搜索</label>

            <input
                class="search-input"
                type="search"
                placeholder="书名/ISBN"
                name="stext"
                v-model="searchText"
                autocomplete="off"
            />
            <span class="spliter"></span>
            <button type="submit" class="btn-go">
                <svg
                    focusable="false"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    class="svg-search"
                >
                    <path
                        d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                    ></path>
                </svg>
            </button>
            <button
                type="button"
                class="btn-expand"
                :class="{ expand: filter_expend }"
                @click="filter_expend = !filter_expend"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="svg-down-arrow"
                >
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </button>
            <collapse class="filter-collapse" :is-expand="filter_expend">
                <slot></slot>
            </collapse>
        </div>
    </form>
</template>

<script>
import Collapse from "./Collapse";

export default {
    name: "Searchbar",
    components: {
        Collapse,
    },
    data() {
        return {
            filter_expend: false,
            searchText: "",
            // filter_expend: true,
        };
    },
    mounted() {
        // this.filter_expend = false;
    },
};
</script>

<style lang="scss" scoped>
.search-form {
    margin: 1em;
}

.search-input-wrapper {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    // margin: auto;
    // width: 80%;
    border: solid 1px #dfe1e5;

    border-radius: 25px;
    // overflow: hidden;
    &:hover {
        box-shadow: 0 1px 6px 0 rgba(32, 33, 36, 0.28);
        border-color: rgba(0, 0, 0, 0);
    }
    .search-label {
        // background-color: rosybrown;
        // display: flex;
        // align-items: center;
        display: none;
    }

    .search-input {
        flex: 1;
        outline: 0 none rgba(0, 0, 0, 0);
        background-color: cornsilk;
        border: none;
        border-radius: 25px;
        font-size: 1rem;
        padding: 0.5rem;
        margin-left: 0.5em;
    }
    .spliter {
        // font-size: 6px;
        // width: 1px;
        border-left: 2px solid #dfe1e5;
        height: 1.3em;
    }
    .btn-go,
    .btn-expand {
        width: 2.5rem;
        height: 2.2rem;

        border: 0;
        outline: none;
        background-color: rgba(0, 0, 0, 0);
        display: flex;
        align-items: center;
        transition: all 0.5s ease-in-out;
        cursor: pointer;
        // pointer-events: all;
        // transform: translateX(6px);
        svg {
            // pointer-events: fill;
            height: 80%;
            margin: auto;
        }
        .svg-search {
            fill: #4285f4;
            transition: fill 0.5s ease-in-out;
            &:hover {
                fill: rgb(89, 145, 5);
            }
        }
        .svg-down-arrow {
            transition: stroke 0.5s ease-in-out;

            stroke: #4285f4;
        }

        &.expand {
            transform: rotate(180deg);
            .svg-down-arrow {
                stroke: rgb(89, 145, 5);
            }
        }
    }

    .filter-collapse {
        width: 100%;
    }
}
</style>