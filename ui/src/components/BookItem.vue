<template>
    <!-- <div class="card"> -->
    <tr v-if="listview" @click="show_modal = true">
        <td>
            {{ bookdata.title }}
        </td>
        <td>
            <author-tool :bid="bookdata.bid" :textview="true" />
        </td>
        <td v-for="(key, idx) in columns" :key="idx">
            <!-- <span
                v-if="key.val === 'class'"
                class="class"
                :class="entry[key.name]"
                @click="setClass(entry.uid)"
                >{{ entry[key] }}</span
            > -->
            <span>{{ bookdata[key.val] }}</span>
        </td>
    </tr>
    <card @click="show_modal = true" :data-image="cover.src" v-else>
        <template v-slot:header>
            <h1>{{ book_props.title.val }}</h1>
        </template>
        <template v-slot:content>
            <p>&nbsp;</p>
        </template>
        <!-- <h1 slot="header">Canyons</h1>
            <p slot="content">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p> -->
    </card>
    <!-- </div> -->
    <teleport to="#app">
        <div
            class="modal_mask"
            v-show="show_modal"
            :class="{ shown: show_modal }"
            @click="show_modal = false"
        >
            <div class="modal">
                <div class="book" @click.stop>
                    <span class="btn_close" @click="show_modal = false"
                        >&times;</span
                    >
                    <div class="header">
                        <div class="left">
                            <img
                                :src="cover.src"
                                v-bind:alt="cover.alt"
                                @click="changeCover"
                            />
                            <div class="tag-box">
                                <tag-tool
                                    :toggle-add="
                                        userclass !== 'user' &&
                                        userclass !== 'guest'
                                    "
                                    :bid="bookdata.bid"
                                    :toggle-delete="
                                        userclass !== 'guest' &&
                                        userclass !== 'user'
                                    "
                                />
                            </div>
                            <div class="author-box">
                                <author-tool
                                    :toggle-add="
                                        userclass !== 'user' &&
                                        userclass !== 'guest'
                                    "
                                    :bid="bookdata.bid"
                                    :toggle-delete="
                                        userclass !== 'guest' &&
                                        userclass !== 'user'
                                    "
                                />
                            </div>
                        </div>
                        <div class="right">
                            <h5>简介</h5>
                            <div id="book_intro">
                                {{ book_intro }}
                            </div>
                        </div>
                    </div>

                    <div class="book-props">
                        <div
                            class="input_group"
                            v-for="(val, key, idx) in book_props"
                            :key="idx"
                        >
                            <label :for="key">{{ val.label }}</label>
                            <input
                                v-bind:type="val.type"
                                v-model="val.val"
                                :name="key"
                                :disabled="val.disabled"
                            />
                            <button
                                v-if="
                                    userclass !== 'guest' &&
                                    userclass !== 'user'
                                "
                                class="btn_edit"
                                :class="{ active: !val.disabled }"
                                @click="onBtnEditClicked(val, key)"
                            >
                                <!-- {{ val.disabled ? "🖊️" : "✔️" }} -->
                                <svg
                                    v-if="val.disabled"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        d="M18.363 8.464l1.433 1.431-12.67 12.669-7.125 1.436 1.439-7.127 12.665-12.668 1.431 1.431-12.255 12.224-.726 3.584 3.584-.723 12.224-12.257zm-.056-8.464l-2.815 2.817 5.691 5.692 2.817-2.821-5.693-5.688zm-12.318 18.718l11.313-11.316-.705-.707-11.313 11.314.705.709z"
                                    />
                                </svg>
                                <svg
                                    v-else
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"
                                    />
                                </svg>
                            </button>
                        </div>
                        <!-- <input type="text" v-model="title.val" :disabled="title.disabled">
                    <input type="text" v-model="isbn.val" :disabled="isbn.disabled">
                    <input type="number" v-model="year.val" :disabled="year.disabled">
                    <input type="number" v-model="page.val" :disabled="page.disabled">
                    <input type="number" v-model="rem.val" :disabled="rem.disabled"> -->
                    </div>
                    <div class="footer">
                        <material-button
                            class="btn_remove"
                            v-if="can_delete"
                            :content="'删除'"
                            @click="deleteBook"
                        />
                        <material-button
                            class="btn_borrow"
                            :disabled="!can_borrow"
                            :content="'借阅'"
                            @click="borrowBook"
                        />
                    </div>
                </div>
            </div>
        </div>
    </teleport>
</template>

<script>
import Card from "./Card";
import MaterialButton from "./MaterialButton";
import TagTool from "./TagTool";
import AuthorTool from "./AuthorTool";
export default {
    name: "BookItem",
    components: {
        Card,
        MaterialButton,
        TagTool,
        AuthorTool,
    },
    props: {
        bookdata: Object,
        userclass: String,
        listview: Boolean,
    },
    created() {
        this.fetchCover();
    },
    data() {
        return {
            show_modal: false,
            cover: {
                src: this.bookdata.cover || "/cover.png",
                alt: "cover",
            },
            columns: [
                {
                    name: "出版社",
                    val: "pub",
                },
                {
                    name: "出版年",
                    val: "year",
                },

                {
                    name: "页数",
                    val: "page",
                },
                {
                    name: "剩余",
                    val: "rem",
                },
                {
                    name: "总数",
                    val: "total",
                },
                {
                    name: "ISBN",
                    val: "isbn",
                },
            ],
            book_intro: this.bookdata.intro,
            book_props: {
                title: {
                    label: "书名",
                    val: this.bookdata.title || "title",
                    type: "text",
                    disabled: true,
                },
                pub: {
                    label: "出版社",
                    val: this.bookdata.pub || "",
                    type: "text",
                    disabled: true,
                },
                isbn: {
                    label: "ISBN",
                    val: this.bookdata.isbn || "isbn",
                    type: "text",
                    disabled: true,
                },
                year: {
                    label: "出版年",
                    val: this.bookdata.year || 0,
                    type: "number",
                    disabled: true,
                },
                page: {
                    label: "页数",
                    val: this.bookdata.page || 0,
                    type: "number",
                    disabled: true,
                },
                rem: {
                    label: "余量",
                    val: this.bookdata.rem || 0,
                    type: "number",
                    disabled: true,
                },
                total: {
                    label: "总数",
                    val: this.bookdata.total || 0,
                    type: "number",
                    disabled: true,
                },
            },
        };
    },
    computed: {
        can_delete() {
            return this.userclass !== "user" && this.userclass !== "guest";
        },
        can_borrow() {
            return this.userclass !== "guest" && this.bookdata.rem > 0;
        },
    },
    methods: {
        async changeCover() {
            if (this.userclass === "guest" || this.userclass === "user") {
                return;
            }
            var imgUrl = prompt("图片url:");
            if (!imgUrl) return;
            var data = new FormData();
            try {
                imgUrl = new URL(
                    `https://cors-anywhere.herokuapp.com/${imgUrl}`
                );
                var image = await fetch(imgUrl, {
                    method: "GET",
                    referrer: "",
                });
                image = await image.blob();
                console.log(image);
                data.append("cover", image, "cover");
            } catch {
                alert("Failed to fetch image");
                return;
            }
            var res = await fetch(`/api/book/${this.bookdata.bid}/setcover`, {
                method: "POST",
                body: data,
            });
            res = await res.json();
            if (!res.ok) {
                console.log(res.err);
            }
            else this.cover.src = res.data.cover;
        },
        async fetchCover() {
            var res = await fetch(`/api/book/${this.bookdata.bid}/cover`, {
                method: "get",
            });
            res = await res.json();
            if (res.ok) {
                this.cover.src = res.data.cover || "/cover.png";
            }
        },
        borrowBook() {
            if (!confirm(`申请借阅 「${this.bookdata.title}」 ?`)) return;
            fetch(`/api/borrow/${this.bookdata.bid}`, { method: "POST" })
                .then((res) => res.json())
                .catch((err) => alert("Failed: " + JSON.stringify(err)));
        },
        deleteBook() {
            if (confirm(`删除 「${this.bookdata.title}」`)) {
                fetch(`/api/book/del/${this.bookdata.bid}`, { method: "POST" })
                    .then((res) => res.json())
                    .then((res) => {
                        if (res.ok) {
                            this.$root.books = this.$root.books.filter(
                                (e) => e.bid !== this.bookdata.bid
                            );
                        }
                    })
                    .catch((err) => alert("Failed: " + JSON.stringify(err)));
            }
        },

        onBtnEditClicked(val, key) {
            if (val.disabled === true) {
                val.disabled = false;
            } else {
                val.disabled = true;
                var x = this.$root.books.filter(
                    (e) => e.bid === this.bookdata.bid
                )[0];
                if (val.val == x[key]) {
                    return;
                } else {
                    let body = new FormData();
                    body.append(key, val.val);
                    fetch(`/api/book/${this.bookdata.bid}/set`, {
                        method: "POST",
                        body: body,
                    })
                        .then((res) => res.json())
                        .then((res) => {
                            if (res.ok) {
                                x[key] = res.data[key];
                            } else {
                                console.log(res.msg);
                            }
                            this.updateBook();
                        })
                        .catch((err) => console.log(err));
                }
            }
        },
        updateBook() {
            this.book_props = {
                title: {
                    label: "书名",
                    val: this.bookdata.title || "title",
                    type: "text",
                    disabled: true,
                },
                pub: {
                    label: "出版社",
                    val: this.bookdata.pub || "",
                    type: "text",
                    disabled: true,
                },
                isbn: {
                    label: "ISBN",
                    val: this.bookdata.isbn || "isbn",
                    type: "text",
                    disabled: true,
                },
                year: {
                    label: "出版年",
                    val: this.bookdata.year || 0,
                    type: "number",
                    disabled: true,
                },
                page: {
                    label: "页数",
                    val: this.bookdata.page || 0,
                    type: "number",
                    disabled: true,
                },
                rem: {
                    label: "余量",
                    val: this.bookdata.rem || 0,
                    type: "number",
                    disabled: true,
                },
                total: {
                    label: "总数",
                    val: this.bookdata.total || 0,
                    type: "number",
                    disabled: true,
                },
            };
        },
    },
};
</script>

<style lang="scss" scoped>
.card {
    display: flex;
}

.modal_mask {
    z-index: 233;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: table;
}

.modal {
    display: table-cell;
    vertical-align: middle;
}

.btn_close {
    float: right;
    padding-right: 5px;
    font-size: 2em;
    cursor: pointer;
    transition: all 0.5s ease-in-out;
    &:hover {
        color: red;
        /* transition: all 1s ease-in-out; */
    }
}

.book {
    border: solid 1px rgba(240, 145, 216, 0.3);
    background-color: rgba(255, 245, 238, 0.815);
    border-radius: 4px;
    max-width: 40em;
    margin: auto;
    transition: all 1s ease-in-out;

    max-height: 90vh;
    overflow-y: scroll;
    &::-webkit-scrollbar {
        width: 3px;
    }

    &::-webkit-scrollbar-track {
        box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    }

    &::-webkit-scrollbar-thumb {
        background-color: rgba(245, 211, 117, 0.822);
        outline: 1px solid rgba(128, 224, 248, 0.219);
    }

    .header {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        .left img {
            max-width: 100%;
        }
        .left {
            /* flex: 0 1; */
            width: 233px;
            .tag-box,
            .author-box {
                border: 2px solid silver;
            }
            .author-box {
                border-top: none;
            }
        }
        .right {
            flex: 1 1 15rem;
            padding: 0 1.2em;
            margin: auto 0;
            text-align: left;
        }
        .book_intro {
            white-space: pre-wrap;
        }
    }
    .book-props {
        border-top: 2px solid cornsilk;
        margin-top: 0.3em;
    }
}

.input_group {
    width: 80%;
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
    margin: 0 auto;
    margin-top: 1em;
    border: solid 1px rgba(15, 78, 250, 0.315);
    border-radius: 5px;
    overflow: hidden;
    label {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 3rem;
    }
    &:last-child {
        margin-bottom: 1em;
    }
    input {
        flex: 1;
        margin-right: 1px;
    }
    input,
    button {
        border: none;
        outline: none;
        transition: all 0.5s ease-in-out;
        padding: 0.4rem;
    }

    button.active {
        background-color: rgba(64, 224, 163, 0.664);
    }
    button {
        background-color: rgba(33, 149, 243, 0.767);
        padding: 0 0.4rem;
        svg {
            width: 1rem;
            height: 1rem;
        }
    }
}

/* 
.footer {
    display: flex;
    justify-content: space-around;
} */
.footer {
    display: flex;
    justify-content: space-around;
    button {
        margin: 0 0.5rem;
        margin-bottom: 0.5rem;
    }
}
tr {
    border-bottom: 1px solid silver;
    td {
        padding: 0.4rem 0;
        &:first-child {
            max-width: 10rem;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
        }
    }
}
</style>