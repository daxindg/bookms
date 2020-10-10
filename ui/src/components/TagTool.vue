<template>
    <template v-if="textview">
        <span>{{ textContent }}</span>
    </template>
    <template v-else>
        <div class="container" :class="{ small: !large }">
            <div class="header">
                <span class="title" v-if="hideTitle !== true">标签</span>
                <search-bar
                    class="searchbar"
                    v-if="toggleSearch"
                    v-model:search-text="searchText"
                ></search-bar>
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
                    class="tag"
                    v-for="(tag, idx) in bid === undefined ? allTags : tags"
                    :key="idx"
                    :class="{ active: tag.active && bid === undefined }"
                    @click="onClickTag(tag)"
                >
                    {{ tag.name }}
                    <span class="bcount" v-if="toggleCount">{{
                        tag.bcount
                    }}</span>
                    <span
                        class="close"
                        v-if="toggleDelete"
                        @click.stop="removeTag(tag.tid)"
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
            :title="'新建标签'"
            v-if="toggleAdd"
        >
            <form
                class="form"
                id="new-tag-form"
                @submit.stop.prevent="submitNewTag"
            >
                <div
                    class="form-control"
                    v-for="key in Object.keys(new_tag_form).sort()"
                    :key="new_tag_form[key].order"
                    :class="{
                        success: new_tag_form[key].valid === true,
                        error: new_tag_form[key].valid === false,
                    }"
                >
                    <label :for="key">{{ new_tag_form[key].label_name }}</label>
                    <input
                        :type="new_tag_form[key].type"
                        :name="key"
                        v-model="new_tag_form[key].value"
                        @focus="focus = true"
                        @focusout="inputFocusout"
                        autocomplete="off"
                    />
                    <div class="dropdown-container">
                        <div
                            class="dropdown"
                            v-if="bid !== undefined && focus === true"
                        >
                            <div
                                class="dropdown-item"
                                v-for="(item, idx) in dropdownItems"
                                :key="idx"
                                @click="
                                    () => {
                                        focus = false;
                                        new_tag_form[key].value = item.name;
                                    }
                                "
                            >
                                {{ item.name }}
                            </div>
                        </div>
                    </div>
                    <span
                        class="check status"
                        v-if="new_tag_form[key].valid === true"
                        >✔️</span
                    >
                    <span
                        class="cross status"
                        v-if="new_tag_form[key].valid === false"
                        >❌</span
                    >
                    <small v-if="new_tag_form[key].valid === false">{{
                        new_tag_form[key].err
                    }}</small>
                </div>
            </form>
            <template v-slot:footer>
                <material-button
                    type="submit"
                    form="new-tag-form"
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
    name: "TagTool",
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
            tags: [],
            new_tag_form: {
                name: {
                    order: 1,
                    label_name: "标签名",
                    type: "text",
                    focus: false,
                    value: "",
                    err: "",
                },
            },
            show_modal_add: false,

            searchText: "",
            submiting: false,
            focus: false,
        };
    },
    watch: {
        searchText(val) {
            val = val.trim();
            if (val) {
                var regex = RegExp(val);
                var act = this.$root.tags.filter((e) => e.active);
                var iact = this.$root.tags.filter((e) => !e.active);
                var miact = iact.filter((e) => regex.test(e.name));
                var imiact = iact.filter((e) => !regex.test(e.name));
                this.$root.tags = [...act, ...miact, ...imiact];
            }
        },
    },
    computed: {
        dropdownItems() {
            if (this.new_tag_form.name.value.trim().length <= 0) return;
            try {
                var regex = new RegExp(this.new_tag_form.name.value.trim());
            } catch {
                return;
            }
            var res = this.allTags.filter((e) => regex.test(e.name));
            console.log(res);
            return res;
        },
        allTags() {
            return this.$root.tags;
        },
        textContent() {
            return this.tags.map((e) => e.name).join(";");
        },
    },
    methods: {
        onClickTag(tag) {
            if (this.bid !== undefined) return;
            tag.active = !tag.active;
            this.$root.tags = [
                ...this.$root.tags.filter((e) => e.active),
                ...this.$root.tags.filter((e) => !e.active),
            ];
        },
        inputFocusout() {
            setTimeout(() => (this.focus = false), 200);
        },
        fetchTags() {
            if (this.bid === undefined) {
                this.$root.tags = this.$root.tags.map((e) => {
                    e.active = false;
                    return e;
                });
                return;
            }
            fetch(`/api/tag/list/${this.bid || ""}`, {
                method: "GET",
            })
                .then((res) => res.json())
                .then((res) => {
                    if (res.ok) {
                        this.tags = res.data;
                    }
                })
                .catch((err) => console.log(err));
        },
        submitNewTag(e) {
            if (this.bid === undefined) {
                var data = new FormData(e.target);

                let name = this.new_tag_form.name;
                name.value = name.value.trim();
                if (name.value.length <= 0) {
                    name.valid = false;
                    name.err = "标签名不可为空";
                } else if (
                    this.$root.tags.filter((e) => e.name === name.value)
                        .length > 0
                ) {
                    name.valid = false;
                    name.err = "标签已存在";
                } else {
                    name.valid = true;
                    name.err = "";
                }
                if (name.valid) {
                    this.submiting = true;
                    fetch("/api/tag/new", {
                        method: "POST",
                        body: data,
                    })
                        .then((res) => res.json())
                        .then((res) => {
                            if (res.ok) {
                                this.$root.tags.push(res.data);
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
            } else {
                let name = this.new_tag_form.name;
                name.value = name.value.trim();
                if (name.value.length <= 0) {
                    name.valid = false;
                    name.err = "标签名不可为空";
                } else if (
                    this.tags.filter((e) => e.name === name.value).length > 0
                ) {
                    name.valid = false;
                    name.err = "标签已存在";
                } else {
                    if (
                        this.$root.tags.filter((e) => e.name === name.value)
                            .length <= 0
                    ) {
                        name.valid = false;
                        name.err = "标签不存在";
                    } else {
                        let tid = this.$root.tags.filter(
                            (e) => e.name === name.value
                        )[0].tid;
                        this.submiting = true;
                        fetch(`/api/tag/add/${tid}/${this.bid}`, {
                            method: "POST",
                        })
                            .then((res) => res.json())
                            .then((res) => {
                                if (res.ok) {
                                    name.valid = true;
                                    let x = this.$root.tags.filter(
                                        (e) => e.name === name.value
                                    )[0];
                                    x.bcount++;
                                    this.tags.push(x);
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
            }
        },
        removeTag(tid) {
            if (confirm(`删除标签?`)) {
                fetch(`/api/tag/del/${tid}/${this.bid || ""}`, {
                    method: "POST",
                })
                    .then((res) => res.json())
                    .then((res) => {
                        if (res.ok) {
                            if (this.bid !== undefined) {
                                this.tags = this.tags.filter(
                                    (e) => e.tid !== res.data.tid
                                );
                                this.$root.tags.filter(
                                    (e) => e.tid === res.data.tid
                                )[0].bcount--;
                            } else
                                this.$root.tags = this.$root.tags.filter(
                                    (e) => e.tid !== res.data.tid
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
        this.fetchTags();
    },

    unmounted() {
        if (this.bid === undefined) {
            this.$root.tags = this.$root.tags.map((e) => {
                e.active = false;
                return e;
            });
        }
    },
};
</script>

<style lang="scss" scoped>
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
        display: flex;
        flex-wrap: wrap;
        .tag {
            margin: 0.2em;
            display: inline-flex;
            justify-content: space-between;
            align-items: center;
            // border: solid 2px rgb(22, 129, 13);
            border-radius: 1em;
            padding: 0 0.5em;
            cursor: pointer;
            user-select: none;
            background-color: rgba(150, 220, 241, 0.911);
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
    .dropdown {
        width: 100%;
        position: absolute;
        top: 0;
        left: 0;
        .dropdown-item {
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
}
</style>