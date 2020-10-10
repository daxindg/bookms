<template>
    <template v-if="textview">
        <span class="authortext">{{ textContent }}</span>
    </template>
    <template v-else>
        <div class="container" :class="{ small: !large }">
            <div class="header">
                <span class="title" v-if="hideTitle !== true">作者</span>
                <search-bar
                    class="searchbar"
                    v-if="toggleSearch"
                    @focusin="searchfocus = true"
                    @focusout="inputFocusout"
                    v-model:search-text="inputSearchAuthorName"
                    @submit="chooseAuthor"
                >
                    <div
                        class="dropdown-container collapse"
                        v-if="searchfocus === true"
                    >
                        <div class="dropdown">
                            <div
                                class="dropdown-item"
                                v-for="(item, idx) in dropdownItems"
                                :key="idx"
                                @click="
                                    () => {
                                        searchfocus = false;
                                        inputSearchAuthorName = item.name;
                                    }
                                "
                            >
                                {{ item.name }}
                            </div>
                        </div>
                    </div>
                </search-bar>

                <button
                    type="button"
                    class="add-new"
                    v-if="toggleAdd"
                    @click="show_modal_add = true"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="#00b0ff"
                    >
                        <path d="M24 10h-10v-10h-4v10h-10v4h10v10h4v-10h10z" />
                    </svg>
                </button>
            </div>
            <div class="spliter" v-if="large"></div>
            <div class="content">
                <div
                    class="item"
                    v-for="(author, idx) in authors"
                    :key="idx"
                    @click="unchooseAuthor(author.aid)"
                >
                    {{ author.name }}
                    <span class="bcount" v-if="toggleCount">{{
                        author.bcount
                    }}</span>
                    <span
                        class="close"
                        v-if="toggleDelete"
                        @click.stop="removeAuthor(author.aid)"
                        >&times;</span
                    >
                </div>
            </div>
            <div class="footer"></div>
        </div>

        <modal
            class="modal-add small"
            :show-modal="show_modal_add"
            @close="show_modal_add = false"
            :title="'新建作者'"
            v-if="toggleAdd"
        >
            <form
                class="form"
                id="new-author-form"
                @submit.prevent="submitNewAuthor"
            >
                <div
                    class="form-control"
                    v-for="key in Object.keys(new_author_form).sort()"
                    :key="new_author_form[key].order"
                    :class="{
                        success: new_author_form[key].valid === true,
                        error: new_author_form[key].valid === false,
                    }"
                >
                    <label :for="key">{{
                        new_author_form[key].label_name
                    }}</label>
                    <input
                        :type="new_author_form[key].type"
                        :name="key"
                        v-model="new_author_form[key].value"
                        @focus="inputfocus = true"
                        @focusout="inputFocusout"
                        autocomplete="off"
                    />
                    <div class="dropdown-container" v-if="inputfocus === true">
                        <div class="dropdown">
                            <div
                                class="dropdown-item"
                                v-for="(item, idx) in dropdownItems"
                                :key="idx"
                                @click="
                                    () => {
                                        inputfocus = false;
                                        new_author_form[key].value = item.name;
                                    }
                                "
                            >
                                {{ item.name }}
                            </div>
                        </div>
                    </div>
                    <span
                        class="check status"
                        v-if="new_author_form[key].valid === true"
                        >✔️</span
                    >
                    <span
                        class="cross status"
                        v-if="new_author_form[key].valid === false"
                        >❌</span
                    >
                    <small v-if="new_author_form[key].valid === false">{{
                        new_author_form[key].err
                    }}</small>
                </div>
            </form>
            <template v-slot:footer>
                <material-button
                    type="submit"
                    form="new-author-form"
                    :content="submiting ? 'submiting' : 'submit'"
                />
            </template>
        </modal>
    </template>
</template>

<script>
import SearchBar from "./CollapseSearchBox";
import Modal from "./Modal";
import MaterialButton from "./MaterialButton";

export default {
    name: "AuthorTool",
    components: {
        SearchBar,
        Modal,
        MaterialButton,
    },
    props: {
        large: Boolean,
        toggleSearch: Boolean,
        toggleAdd: Boolean,
        toggleCount: Boolean,
        toggleDelete: Boolean,
        hideTitle: Boolean,
        bid: Number,
        textview: Boolean,

        // allTags: Array
    },
    data() {
        return {
            authors: [],
            new_author_form: {
                name: {
                    order: 1,
                    label_name: "作者名",
                    type: "text",
                    value: "",
                    err: "",
                },
            },
            dropdownItems: [],
            show_modal_add: false,
            submiting: false,
            searchfocus: false,
            inputfocus: false,
            inputSearchAuthorName: "",
        };
    },
    computed: {
        inputAuthorName() {
            return this.new_author_form.name.value;
        },
        textContent() {
            return this.authors.map((e) => e.name).join(";");
        },
    },
    watch: {
        inputAuthorName(newValue) {
            if (newValue.trim().length <= 0) {
                this.inputfocus = false;
                this.dropdownItems = [];
                return;
            }
            if (
                newValue.trim().length <= 0 ||
                this.dropdownItems.filter((e) => newValue === e.name).length > 0
            )
                return;
            if (typeof this.timeoutID === "number") {
                clearTimeout(this.timeoutID);
            }
            this.timeoutID = setTimeout(() => {
                fetch(`/api/author/search/${newValue.trim()}`, {
                    method: "GET",
                })
                    .then((res) => res.json())
                    .then((res) => {
                        if (res.ok && this.inputAuthorName.trim().length > 0) {
                            this.dropdownItems = res.data;
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }, 1000);
        },
        inputSearchAuthorName(newValue) {
            if (newValue.trim().length <= 0) {
                this.searchfocus = false;
                this.dropdownItems = [];
                return;
            }
            if (
                newValue.trim().length <= 0 ||
                this.dropdownItems.filter((e) => newValue === e.name).length > 0
            ) {
                return;
            }
            if (typeof this.timeoutID === "number") {
                clearTimeout(this.timeoutID);
            }
            this.timeoutID = setTimeout(() => {
                fetch(`/api/author/search/${newValue.trim()}`, {
                    method: "GET",
                })
                    .then((res) => res.json())
                    .then((res) => {
                        if (
                            res.ok &&
                            this.inputSearchAuthorName.trim().length > 0
                        ) {
                            this.dropdownItems = res.data;
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }, 1000);
        },
    },
    methods: {
        chooseAuthor() {
            var name = this.inputSearchAuthorName;
            if (
                this.dropdownItems.filter((e) => e.name === name.trim())
                    .length > 0 &&
                this.authors.filter((e) => e.name === name.trim()).length <= 0
            ) {
                this.authors.push(
                    this.dropdownItems.filter((e) => e.name === name.trim())[0]
                );
                this.$emit("authors-changed", this.authors);

                this.inputSearchAuthorName = "";
                this.dropdownItems = [];
                this.inputfocus = false;
                this.searchfocus = false;
            }
        },
        unchooseAuthor(aid) {
            if (this.bid !== undefined) return;
            this.authors = this.authors.filter((e) => e.aid !== aid);
            this.$emit("authors-changed", this.authors);
        },
        inputFocusout() {
            setTimeout(() => {
                this.inputfocus = false;
                this.searchfocus = false;
            }, 200);
        },
        fetchAuthors() {
            if (this.bid === undefined) return;
            fetch(`/api/author/list/${this.bid}`, {
                method: "GET",
            })
                .then((res) => res.json())
                .then((res) => {
                    if (res.ok) {
                        this.authors = res.data;
                    }
                })
                .catch((err) => console.log(err));
        },
        submitNewAuthor(e) {
            if (this.bid === undefined) {
                var data = new FormData(e.target);

                let name = this.new_author_form.name;
                name.value = name.value.trim();
                if (name.value.length <= 0) {
                    name.valid = false;
                    name.err = "作者名不可为空";
                } else {
                    name.valid = true;
                    name.err = "";
                }
                if (name.valid) {
                    this.submiting = true;
                    fetch("/api/author/new", {
                        method: "POST",
                        body: data,
                    })
                        .then((res) => res.json())
                        .then((res) => {
                            if (!res.ok) {
                                name.valid = false;
                                name.err = res.msg;
                            }
                            this.submiting = false;
                        })
                        .catch((err) => {
                            console.log(err);
                            name.valid = false;
                            name.err = "网络错误";
                            this.submiting = false;
                        });
                }
            } else {
                let name = this.new_author_form.name;
                name.value = name.value.trim();
                if (name.value.length <= 0) {
                    name.valid = false;
                    name.err = "作者名不可为空";
                } else if (
                    this.dropdownItems.filter((e) => e.name === name.value)
                        .length <= 0
                ) {
                    name.valid = false;
                    name.err = "作者不存在";
                } else {
                    this.submiting = true;
                    let x = this.dropdownItems.filter(
                        (e) => e.name === name.value
                    )[0];
                    fetch(`/api/author/add/${x.aid}/${this.bid}`, {
                        method: "POST",
                    })
                        .then((res) => res.json())
                        .then((res) => {
                            if (res.ok) {
                                this.authors.push(x);
                                name.valid = true;
                                setTimeout(() => {
                                    this.show_modal_add = false;
                                    delete name.valid;
                                    name.err = "";
                                    name.value = "";
                                }, 500);
                            } else {
                                name.valid = false;
                                name.err = res.msg;
                            }
                            this.submiting = false;
                        })
                        .catch((err) => {
                            console.log(err);
                            name.valid = false;
                            name.err = "网络错误";
                            this.submiting = false;
                        });
                }
            }
        },
        removeAuthor(aid) {
            if (confirm(`删除作者?`)) {
                fetch(`/api/author/del/${aid}/${this.bid || ""}`, {
                    method: "POST",
                })
                    .then((res) => res.json())
                    .then((res) => {
                        if (res.ok) {
                            this.authors = this.authors.filter(
                                (e) => e.aid !== res.data.aid
                            );
                        } else {
                            alert(res.msg);
                        }
                    })
                    .catch((err) => console.log(err));
            }
        },
    },
    created() {
        this.fetchAuthors();
    },
};
</script>

<style lang="scss" scoped>
.authortext {
    display: block;
    max-width: 15rem;
    text-overflow: ellipsis;
    overflow: hidden;
}
.container {
    // border: solid 1px rgba(143, 143, 143, 0.747);

    border-radius: 8px;
    margin: 0.5em;
    padding: 0;
    &.small {
        margin: 0;
        .header {
            .title {
                font-size: 14px;
                font-weight: 700;
            }
        }
    }
    .spliter {
        border-bottom: solid 1px rgb(218, 210, 210);
        margin-bottom: 0.5em;
        margin-top: 0.2em;
        width: 100%;
    }
    .header {
        display: flex;
        align-items: center;
        width: 100%;
        text-align: left;
        // justify-content: space-between;
        .title {
            flex: 1;
        }
        .add-new {
            display: inline-flex;
            align-items: center;
            width: 20px;
            height: 20px;

            padding: 0 0.2rem;
            margin: 0 0.5em;
            border: 0;
            outline: none;
            background-color: rgba(0, 0, 0, 0);
            border-radius: 50%;
            cursor: pointer;
            svg {
                transition: all 0.5s ease-in-out;
            }
            &:hover svg {
                // box-shadow: 0 1px 6px 0 rgba(32,33,36,0.28);
                fill: rgb(89, 145, 5);
            }
        }
    }
    .content {
        position: relative;
        width: 100%;
        min-height: 1.6rem;
        display: flex;
        flex-wrap: wrap;

        .item {
            margin: 0.2em;
            display: inline-flex;
            justify-content: space-between;
            align-items: center;
            border: solid 1px rgb(22, 129, 13);
            border-radius: 0.5em;
            padding: 0 0.5em;
            cursor: pointer;
            user-select: none;
            background-color: rgba(0, 138, 0, 0.616);
            transition: background-color 0.5s ease-in-out;
            &:hover {
                box-shadow: 0 1px 6px 0 rgba(32, 33, 36, 0.28);
            }
            &.active {
                background-color: rgba(0, 170, 0, 0.616);
                box-shadow: 0 1px 6px 0 rgba(32, 33, 36, 0.28);
            }

            .bcount {
                display: inline-flex;
                align-items: center;
                font-size: 13px;
                background-color: rgba(92, 91, 91, 0.767);
                color: white;
                padding: 0 0.2em;
                height: 70%;
                margin-left: 5px;
                border-radius: 3px;
                line-height: 0;
            }
            .close {
                display: flex;
                align-items: center;
                margin-left: 2px;
                transition: color 0.5s ease-in-out;
                &:hover {
                    color: red;
                }
            }
        }
    }
}
.form {
    padding: 30px 40px;
    .form-control {
        margin-bottom: 10px;
        padding-bottom: 20px;
        position: relative;
        text-align: left;
        .status {
            user-select: none;
            position: absolute;
            top: 34px;
            right: 5px;
        }
        label {
            display: inline-block;
            margin-bottom: 5px;
        }
        input {
            border: 2px solid #f0f0f0;
            border-radius: 4px;
            display: block;
            font-family: inherit;
            font-size: 14px;
            padding: 10px;
            width: 100%;
            box-sizing: border-box;
            &:focus {
                outline: 0;
                border-color: #777;
            }
        }
        &.error input {
            border-color: #e74c3c;
        }
        &.success input {
            border-color: #2ecc71;
        }
        small {
            font-size: 12px;
            color: #e74c3c;
            position: absolute;
            bottom: 0;
            left: 0;
        }
    }
}
.dropdown-container {
    position: relative;
    width: 0px;
    z-index: 998;

    .dropdown {
        width: 150px;
        position: fixed;

        // top: 0;
        // left: 0;
        box-shadow: 0 1px 6px 0 rgba(32, 33, 36, 0.28);
        .dropdown-item {
            // position: fixed;
            // display: block;
            // width: 100%;

            border-left: 2px solid #777;
            border-right: 2px solid #777;
            border-bottom: 2px solid #777;
            padding: 0.3em;
            background-color: rgba(222, 214, 206, 1);
            transition: background-color 0.5s ease-in-out;
            &:first-child {
                border-top: 2px solid #777;
                border-radius: 5px 5px 0 0;
                border-top-left-radius: 5px;
                border-top-right-radius: 5px;
            }
            &:last-child {
                border-bottom-left-radius: 5px;
                border-bottom-right-radius: 5px;
            }
            &:hover {
                background-color: cornsilk;
            }
        }
    }
    &.collapse .dropdown {
        position: absolute;
    }
}
</style>