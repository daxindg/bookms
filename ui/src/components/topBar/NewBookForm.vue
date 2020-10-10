<template>
    <modal class="large" :title="'新书'" :show-modal="showModal">
        <form class="form" @submit.prevent.stop ref="form">
            <div
                class="form-control"
                v-for="key in Object.keys(newbook_form).sort(
                    (a, b) => newbook_form[a].order - newbook_form[b].order
                )"
                :key="newbook_form[key].order"
                :class="{
                    success: newbook_form[key].valid === true,
                    error: newbook_form[key].valid === false,
                }"
            >
                <label :for="key">{{ newbook_form[key].label_name }}</label>
                <input
                    class="input"
                    :type="newbook_form[key].type"
                    :name="key"
                    v-model="newbook_form[key].value"
                    autocomplete="off"
                />
                <span
                    class="check status"
                    v-if="newbook_form[key].valid === true"
                    >✔️</span
                >
                <span
                    class="cross status"
                    v-if="newbook_form[key].valid === false"
                    >❌</span
                >
                <small v-if="newbook_form[key].valid === false">{{
                    newbook_form[key].err
                }}</small>
            </div>
            <div class="form-control">
                <label for="intro">简介</label>
                <textarea name="intro" rows="5" class="input"></textarea>
                <span class="check status" v-if="intro.valid === true">✔️</span>
                <span class="cross status" v-if="intro.valid === false"
                    >❌</span
                >
                <small v-if="intro.valid === false">{{ intro.err }}</small>
            </div>
            <div class="form-control">
                <label for="cover">封面</label>
                <div class="input-group input">
                    <input name="cover" type="file" />
                    <div>或&nbsp;</div>
                    <input
                        type="text"
                        name="cover_url"
                        placeholder="图片URL"
                        autocomplete="off"
                    />
                </div>
            </div>
            <div class="form-control">
                <label
                    >标签
                    <span
                        class="expand-collapse"
                        @click="expandCollapseTags = !expandCollapseTags"
                        ><svg
                            xmlns="http://www.w3.org/2000/svg"
                            :class="{ expand: expandCollapseTags }"
                            viewBox="0 0 24 24"
                        >
                            <path
                                d="M0 7.33l2.829-2.83 9.175 9.339 9.167-9.339 2.829 2.83-11.996 12.17z"
                            /></svg></span
                ></label>
                <collapse :is-expand="expandCollapseTags">
                    <div class="input">
                        <tag-tool
                            :large="true"
                            :hide-title="true"
                            :toggle-search="true"
                            :toggle-add="true"
                        />
                    </div>
                </collapse>
            </div>
            <div class="form-control">
                <label>作者</label>
                <div class="input">
                    <author-tool
                        :large="true"
                        :hide-title="true"
                        :toggle-search="true"
                        :toggle-add="true"
                        @authors-changed="authors = $event"
                    />
                </div>
            </div>
        </form>
        <template v-slot:footer>
            <material-button
                content="提交"
                @click="submitNewBook"
                :disabled="submiting"
            />
        </template>
    </modal>
</template>

<script>
import Modal from "../Modal";
import TagTool from "../TagTool";
import AuthorTool from "../AuthorTool";
import Collapse from "../Collapse";
import MaterialButton from "../MaterialButton";
export default {
    name: "NewBookForm",
    components: {
        Modal,
        TagTool,
        AuthorTool,
        Collapse,
        MaterialButton,
    },
    props: {
        showModal: Boolean,
    },
    data() {
        return {
            expandCollapseTags: false,
            submiting: false,
            authors: [],
            newbook_form: {
                title: {
                    order: 1,
                    label_name: "书名",
                    value: "",
                    type: "text",
                    err: "",
                },
                pub: {
                    order: 2,
                    label_name: "出版社",
                    value: "",
                    type: "text",
                    err: "",
                },
                isbn: {
                    order: 3,
                    label_name: "ISBN",
                    value: "",
                    type: "text",
                    err: "",
                },
                year: {
                    order: 5,
                    label_name: "出版年",
                    value: "",
                    type: "number",
                    err: "",
                },
                page: {
                    order: 4,
                    label_name: "页数",
                    value: "",
                    type: "number",
                    err: "",
                },
                total: {
                    order: 6,
                    label_name: "总数",
                    value: "",
                    type: "number",
                    err: "",
                },
            },
            intro: {
                label_name: "简介",
                value: "",
                err: "",
            },
        };
    },
    methods: {
        async submitNewBook() {
            var data = new FormData(this.$refs.form);
            var ok = true;
            for (var [k, v] of data.entries()) {
                switch (k) {
                    case "title": {
                        let it = this.newbook_form[k];
                        if (v.trim().length <= 0) {
                            it.valid = false;
                            it.err = "书名不可为空";
                            ok = false;
                        } else {
                            it.valid = true;
                        }
                        break;
                    }

                    case "pub": {
                        let it = this.newbook_form[k];
                        if (v.trim().length <= 0) {
                            it.valid = false;
                            it.err = "出版社名不可为空";
                            ok = false;
                        } else {
                            it.valid = true;
                        }
                        break;
                    }
                    case "isbn": {
                        let it = this.newbook_form[k];
                        if (
                            /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/.test(
                                v
                            )
                        ) {
                            it.valid = true;
                        } else {
                            it.valid = false;
                            it.err = "ISBN 10 或 13";
                            ok = false;
                        }
                        break;
                    }
                    case "year": {
                        let it = this.newbook_form[k];
                        let x = parseInt(v);
                        if (
                            x >= 1000 &&
                            x <= parseInt(new Date().getFullYear())
                        ) {
                            it.valid = true;
                        } else {
                            it.valid = false;
                            it.err = "这合适吗¿";
                            ok = false;
                        }
                        break;
                    }
                    case "page": {
                        let it = this.newbook_form[k];
                        let x = parseInt(v);
                        if (x > 0 && x < Number.MAX_SAFE_INTEGER) {
                            it.valid = true;
                        } else {
                            it.valid = false;
                            it.err = "这合适吗¿";
                            ok = false;
                        }

                        break;
                    }
                    case "total": {
                        let it = this.newbook_form[k];
                        let x = parseInt(v);
                        if (x >= 0 && x < Number.MAX_SAFE_INTEGER) {
                            it.valid = true;
                        } else {
                            it.valid = false;
                            it.err = "这合适吗¿";
                            ok = false;
                        }

                        break;
                    }
                    case "intro": {
                        let it = this.intro;
                        if (v.length < 500) {
                            it.valid = true;
                        } else {
                            it.valid = false;
                            it.err = "简介不多于500字";
                            ok = false;
                        }
                        break;
                    }
                    default:
                        break;
                }
            }
            if (ok) {
                let tags = this.$root.tags
                    .filter((e) => e.active === true)
                    .map((e) => e.tid);
                let authors = this.authors.map((e) => e.aid);
                data.append("tags", JSON.stringify(tags));
                data.append("authors", JSON.stringify(authors));
                // console.log(tags, authors);
                this.submiting = true;

                var imgUrl = data.get("cover_url");
                if (imgUrl) {
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
                        data.set("cover", image, "cover");
                    } catch {
                        console.log("url invalid");
                    }
                }
                try {
                    var res = await fetch("/api/book/new", {
                        method: "POST",
                        body: data,
                    });
                    res = await res.json();

                    if (res.ok) {
                        alert("成功");
                        for (let key of Object.keys(this.newbook_form)) {
                            delete this.newbook_form[key].valid;
                            this.newbook_form[key].err = "";
                            this.newbook_form[key].value = "";
                            delete this.intro.valid;
                            this.intro.value = "";
                        }
                        
                    } else {
                        alert(`Failed : ${JSON.stringify(res.err)}`);
                    }
                } catch (err) {
                    console.log(err);
                    alert("网络错误");
                }
                this.submiting = false;
            }
        },
    },
};
</script>

<style lang="scss" scoped>
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
            top: 33px;
            right: 6px;
        }
        label {
            display: inline-block;
            margin-bottom: 5px;
        }
        .input {
            box-sizing: border-box;
            border: 2px solid #f0f0f0;
            border-radius: 4px;
            display: block;
            font-family: inherit;
            font-size: 14px;
            padding: 10px;
            width: 100%;
            &:focus {
                outline: 0;
                border-color: #777;
            }
        }
        textarea {
            box-sizing: border-box;
            resize: none;
            width: 100%;
        }
        &.error .input {
            border-color: #e74c3c;
        }
        &.success .input {
            border-color: #2ecc71;
        }
        small {
            font-size: 12px;
            color: #e74c3c;
            position: absolute;
            bottom: 0;
            left: 0;
        }

        .input-group {
            display: flex;
            align-items: stretch;
            padding: 0;
            input {
                flex: 1;
                background-color: rgba(245, 245, 245, 0.904);
                outline: none;
                border: 2px solid #f0f0f0;

                // border: none;
            }
        }
    }
}

.expand-collapse {
    svg {
        width: 1rem;
        height: 1rem;
        fill: #0095ff;
        transition: transform 0.5s;
        &.expand {
            transform: rotate(180deg);
        }
    }
}
</style>