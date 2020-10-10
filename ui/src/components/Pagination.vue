<template>
    <ul class="page">
        <li
            class="page__btn"
            :class="{ active: currentPage != 1 }"
            @click="currentPage--"
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                    d="M16.67 0l2.83 2.829-9.339 9.175 9.339 9.167-2.83 2.829-12.17-11.996z"
                />
            </svg>
        </li>

        <li
            class="page__numbers"
            @click="currentPage = 1"
            v-if="currentPage > 3 && total > 7"
        >
            1
        </li>
        <li class="page__dots" v-if="total > 7 && currentPage > 3">...</li>

        <li
            class="page__numbers"
            v-for="(pageNumber, idx) in displayedPages"
            :key="idx"
            @click="currentPage = pageNumber"
            :class="{ active: currentPage === pageNumber }"
        >
            {{ pageNumber }}
        </li>

        <li
            class="page__dots"
            v-if="currentPage < total - 2 && total > 7"
        >
            ...
        </li>
        <li
            class="page__numbers"
            @click="currentPage = total"
            v-if="currentPage < total - 2 && total > 7"
        >
            {{total}}
        </li>

        <li
            class="page__btn"
            :class="{ active: currentPage < total }"
            @click="currentPage++"
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                    d="M7.33 24l-2.83-2.829 9.339-9.175-9.339-9.167 2.83-2.829 12.17 11.996z"
                />
            </svg>
        </li>
    </ul>
</template>

<script>
export default {
    name: "Pagination",
    props: {
        total: Number,
    },
    data() {
        return {
            currentPage: 1,
        };
    },
    methods: {

    },
    computed: {
        // display the items per page
        displayedPages() {
            if (this.total <= 7) {
                return Array.from({ length: this.total }, (_, i) => i + 1);
            }

            if (this.currentPage <= 3) {
                return Array.from({ length: 5 }, (_, i) => i + 1);
            } else if (this.currentPage < this.total - 2) {
                return Array.from({length:3}, (_, i) => this.currentPage + i - 1);
            } else {
                return Array.from({ length: 5 }, (_, i) => this.total - 4 + i);
            }
        },
    },
    watch: {
        currentPage() {
            this.$emit("page-updated", this.currentPage);
        },
    },
};
</script>

<style lang="scss" scoped>
*,
*::before,
*::after {
    margin: 0;
    padding: 0;
    box-sizing: inherit;
}

ul {
    --primary: #ffd09bb0;
    --greyLight: #cdd5f7;
    --greyLight-2: #f8f9ff;
    --greyDark: #646b8a;

    box-sizing: border-box;
    font-size: 62.5%;
    font-family: "Poppins", sans-serif;
    letter-spacing: 0.6px;
    line-height: 1.4;
    -webkit-user-select: none;
    backface-visibility: hidden;
    -webkit-font-smoothing: subpixel-antialiased;

    list-style-type: none;
}

.page {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    height: 3rem;
    margin: 3rem 0;
    border-radius: 0.6rem;
    background: #ffffff42;
    box-shadow: 0 0.8rem 2rem rgba(#5a6181, 0.05);

    &__numbers,
    &__btn,
    &__dots {
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 0.8rem;
        font-size: 1.4rem;
        cursor: pointer;
    }

    &__dots {
        width: 1.6rem;
        height: 1.6rem;
        color: var(--greyLight);
        cursor: initial;
    }

    &__numbers {
        width: 2rem;
        height: 2rem;
        border-radius: 0.4rem;

        &:hover {
            color: var(--primary);
        }

        &.active {
            color: #ffffff;
            background: var(--primary);
            font-weight: 600;
        }
    }

    &__btn {
        svg {
            height: 1rem;
            width: 1rem;
            fill: var(--greyLight);
        }
        pointer-events: none;

        &.active {
            svg {
                fill: var(--greyDark);
            }
            pointer-events: initial;

            &:hover {
                color: var(--primary);
            }
        }
    }
}
</style>