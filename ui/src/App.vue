<template>
    <top-bar
        :user="user"
        @login="user = $event"
        @register="user = $event"
        @logout="user = { class: 'guest' }"
    />
    <search-bar @submit-search="search($event)">
        <author-tool
            :large="true"
            :toggle-search="true"
            :toggle-count="true"
            :toggle-add="user.class !== 'guest' && user.class !== 'user'"
            :toggle-delete="user.class !== 'guest' && user.class !== 'user'"
            @authors-changed="authors = $event"
        />
        <tag-tool
            :large="true"
            :toggle-search="true"
            :toggle-count="true"
            :toggle-add="user.class !== 'guest' && user.class !== 'user'"
            :toggle-delete="user.class !== 'guest' && user.class !== 'user'"
        />
    </search-bar>

    <div class="page-nav">
        <pagination :total="totalPages" @page-updated="currentPage = $event" />
        <button class="change-view" type="button" @click="listview = !listview">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                v-if="!listview"
            >
                <path
                    d="M4 22h-4v-4h4v4zm0-12h-4v4h4v-4zm0-8h-4v4h4v-4zm3 0v4h17v-4h-17zm0 12h17v-4h-17v4zm0 8h17v-4h-17v4z"
                />
            </svg>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                v-else
            >
                <path
                    d="M11 11h-11v-11h11v11zm13 0h-11v-11h11v11zm-13 13h-11v-11h11v11zm13 0h-11v-11h11v11z"
                />
            </svg>
        </button>
    </div>

    <div class="fallback" v-if="fallback.trim().length > 0">
        <h1>{{ fallback }}</h1>
    </div>
    <div class="container" v-else>
        <template v-if="listview">
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>书名</th>
                            <th>作者</th>
                            <th>出版社</th>
                            <th>出版年</th>
                            <th>页数</th>
                            <th>剩余</th>
                            <th>总量</th>
                            <th>ISBN</th>
                        </tr>
                    </thead>
                    <tbody>
                        <book-item
                            v-for="book in books"
                            :key="book.bid"
                            :bookdata="book"
                            :userclass="user.class"
                            :listview="true"
                        />
                    </tbody>
                </table>
            </div>
        </template>
        <template v-else>
            <book-item
                v-for="book in books"
                :key="book.bid"
                :bookdata="book"
                :userclass="user.class"
            />
        </template>
    </div>
</template>

<script>
import BookItem from "./components/BookItem.vue";
import TopBar from "./components/topBar/TopBar";
import SearchBar from "./components/Searchbar";
import TagTool from "./components/TagTool";
import AuthorTool from "./components/AuthorTool";
import Pagination from "./components/Pagination";

export default {
    name: "App",
    components: {
        BookItem,
        TopBar,
        SearchBar,
        TagTool,
        AuthorTool,
        Pagination,
    },
    data() {
        return {
            fallback: "loading",
            user: {
                class: "guest",
            },
            books: [],
            tags: [
                {
                    tid: 1,
                    name: "我列开来1",
                    bcount: 233,
                },
            ],
            authors: [],
            totalPages: 1,
            currentPage: 1,
            searchText: "",
            filter_expanded: false,
            listview: false,
        };
    },
    created() {
        this.checkLogin();
        this.fetchData();
        // this.fetchuser();
    },
    methods: {
        fetchData() {
            this.fallback = "Loading";
            fetch("/api/book/list", {
                method: "GET",
            })
                .then((res) => res.json())
                .then((res) => {
                    if (res.ok) {
                        this.books = res.data.books;
                        this.totalPages = res.data.count;
                        // console.log(res.data);
                        this.fallback = "";
                    } else {
                        alert("failed");
                        console.log(res);
                    }
                })
                .catch((err) => {
                    console.log(err);
                    this.fallback = JSON.stringify(err);
                });
            fetch("/api/tag/list", {
                method: "GET",
            })
                .then((res) => res.json())
                .then((res) => {
                    if (res.ok) {
                        this.tags = res.data;
                        // console.log(res.data);
                    } else {
                        alert("failed");
                        console.log(res);
                    }
                })
                .catch((err) => console.log(err));
        },
        checkLogin() {
            fetch("/user/login", {
                method: "POST",
            })
                .then((res) => res.json())
                .then((res) => {
                    if (res.ok) {
                        this.user = res.data;
                    }
                })
                .catch((err) => console.log(err));
        },
        search(searchText) {
            // var data = new FormData();
            // data.append('s_text', searchText);
            // data.append('tags', this.tags.filter(e => e.active).map(e => e.tid));
            // data.append('authors', this.authors.map(e => e.aid));
            // for (let [key, val] of data.entries()) {
            //     console.log(key, val);
            // }
            if (searchText) this.searchText = searchText;
            else searchText = this.searchText;
            var url = new URL("/api/book/list", window.location.origin);
            var params = {
                authors: JSON.stringify(this.authors.map((e) => e.aid)),
                tags: JSON.stringify(
                    this.tags.filter((e) => e.active).map((e) => e.tid)
                ),
                s_text: searchText,
                pno: this.currentPage,
            };
            url.search = new URLSearchParams(params);

            this.fallback = "Loading";
            fetch(url, {
                method: "GET",
            })
                .then((res) => res.json())
                .then((res) => {
                    if (res.ok) {
                        this.books = res.data.books;
                        this.totalPages = parseInt(res.data.count);
                        console.log(this.totalPages);
                        // console.log(res.data);
                        this.fallback = "";
                    } else {
                        alert("failed");
                        console.log(res);
                    }
                })
                .catch((err) => {
                    console.log(err);
                    this.fallback = JSON.stringify(err);
                });
        },
    },
    watch: {
        currentPage() {
            this.search();
        },
    },
};
</script>

<style lang="scss">
* {
    -webkit-tap-highlight-color: transparent;
}

body {
    margin: 0;
    padding: 0;
    background-color: cornsilk;
}

#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    display: block;
    width: 100%;
    margin: auto;
    transition: all 0.5s ease-in-out;
}

@media all and (min-width: 70rem) {
    #app {
        width: 80%;
    }
}
.container {
    display: flex;
    flex-wrap: wrap;
    @media all and (max-width: 430px) {
        flex-direction: column;
        align-items: center;
    }
}
</style>

<style lang="scss" scoped>
.table-container {
    width: 100%;
    overflow: auto;
    table {
        text-align: left;
        background: #7c6c3702;
        border-radius: 0.25em;
        border-collapse: collapse;
        margin: auto;
        white-space: nowrap;
        min-width: 100%;
        // &::-webkit-scrollbar {
        //     width: 1px;
        // }

        // &::-webkit-scrollbar-track {
        //     box-shadow: inset 1px 1px 1px rgba(0, 0, 0, 0.3);
        // }

        // &::-webkit-scrollbar-thumb {
        //     background-color: rgba(245, 211, 117, 0.822);
        //     outline: 1px solid rgba(128, 224, 248, 0.219);
        // }
        tbody {
            tr {
                transition: background 0.25s ease;
                &:hover {
                    background: #5554018c;
                }
            }
        }
    }
    th {
        border-bottom: 1px solid #364043;
        color: #aa996a;
        font-size: 1rem;
        font-weight: 600;
        padding: 5px 10px;
        text-align: left;

        cursor: pointer;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;

        &.active {
            color: rgb(255, 255, 255);
        }

        &.active .arrow {
            opacity: 1;
        }
    }
    td {
        color: rgb(0, 0, 0);
        font-size: 1rem;
        font-weight: 500;
        padding: 0.1rem 10px;

        .class {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            border-radius: 0.5em;
            padding: 0.2em 0.6em;
            overflow: hidden;
            cursor: pointer;
            box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2),
                0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
            &.user {
                background-color: rgb(64, 126, 3);
            }
            &.admin {
                background-color: firebrick;
            }
        }
    }
    .disabled td {
        color: #4f5f64;
    }
}
.page-nav {
    position: relative;

    button.change-view {
        position: absolute;
        top: 25%;
        right: 0;
        outline: none;
        border-radius: 4px;
        border: none;
        background: rgba(0, 0, 0, 0);
        cursor: pointer;
        svg {
            fill: rosybrown;
        }
    }
}
</style>
