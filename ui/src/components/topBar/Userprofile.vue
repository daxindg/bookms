<template>
    <teleport to="#app">
        <modal
            :show-modal="show"
            class="large"
            :title="title"
            @close="$emit('close')"
        >
            <div class="container-userprofile">
                <table>
                    <tbody>
                        <tr>
                            <td>UID</td>
                            <td>{{ user.uid }}</td>
                        </tr>
                        <tr>
                            <td>用户名</td>
                            <td>{{ user.name }}</td>
                        </tr>
                        <tr>
                            <td>邮箱</td>
                            <td>{{ user.email }}</td>
                        </tr>
                        <tr>
                            <td>借阅数</td>
                            <td>{{ user.count }}</td>
                        </tr>
                        <tr>
                            <td>权限</td>
                            <td>{{ user.class }}</td>
                        </tr>
                        <!-- <form action=""> -->

                        <!-- </form> -->
                    </tbody>
                </table>
            </div>
            <template v-slot:footer>
                <material-button :content="'修改密码'"  @click="showChpswModal = true"/>
            </template>
        </modal>
    </teleport>
    <teleport to="#app">
        <template v-if="showChpswModal">
            <modal
                :title="'修改密码'"
                :show-modal="showChpswModal"
                class="small"
                @close="showChpswModal = false"
            >
                <form ref='form' class="form" @submit.prevent.stop>
                    <div
                        class="form-control"
                        v-for="key in Object.keys(inputItems).sort(
                            (a, b) => inputItems[a].order - inputItems[b].order
                        )"
                        :key="inputItems[key].order"
                        :class="{
                            success: inputItems[key].valid === true,
                            error: inputItems[key].valid === false,
                        }"
                    >
                        <label :for="key">{{
                            inputItems[key].label_name
                        }}</label>

                        <input
                            :type="inputItems[key].type"
                            :name="key"
                            v-model="inputItems[key].value"
                            :autocomplete="
                                key === 'password' ? 'new-password' : 'off'
                            "
                        />
                        <span
                            class="check"
                            v-if="inputItems[key].valid === true"
                            >✔️</span
                        >
                        <span
                            class="cross"
                            v-if="inputItems[key].valid === false"
                            >❌</span
                        >
                        <small v-if="inputItems[key].valid === false">{{
                            inputItems[key].err
                        }}</small>
                    </div>
                </form>
                <template v-slot:footer>
                    <material-button :content="'确认'" @click="changePassword"/>
                </template>
            </modal>
        </template>
    </teleport>
</template>

<script>
import Modal from "../Modal";
import MaterialButton from "../MaterialButton"
export default {
    name: "Userprofile",
    props: {
        show: Boolean,
    },
    components: {
        Modal,
        MaterialButton
    },
    data() {
        return {
            user: {
                uid: -1,
                name: "",
                email: "",
                count: "",
                class: "",
            },
            title: "Loading",
            showChpswModal: false,
            inputItems: {
                password0: {
                    order: 1,
                    label_name: "原密码",
                    type: "password",
                    value: "",
                    err: "",
                },
                password: {
                    order: 2,
                    label_name: "新密码",
                    type: "password",
                    value: "",
                    err: "",
                },
                password1: {
                    order: 3,
                    label_name: "确认密码",
                    type: "password",
                    value: "",
                    err: "",
                },
            },
        };
    },
    created() {
        this.fetchData();
    },
    watch: {
        show(val) {
            if (val === true) {
                this.fetchData();
            } else this.title = "Loading";
        },
    },
    methods: {
        fetchData() {
            fetch("/api/user", {
                method: "GET",
            })
                .then((res) => res.json())
                .then((res) => {
                    if (res.ok) {
                        this.user = res.data;
                        this.title = `${res.data.name} 详细信息`;
                    }
                })
                .catch((err) => console.log(err));
        },
        changePassword() {
            let password0 = this.inputItems.password0;
            let password = this.inputItems.password;
            let password1 = this.inputItems.password1;

            let ok = true;

            if (password0.value.length <= 0) {
                password0.valid = false;
                password0.err = "请输入原密码";
                ok = false;
            }
            else {
                password0.valid = true;
                password0.err = "";
            }

            if (password.value.length < 8) {
                password.valid = false;
                password.err = "密码至少8位";
                ok = false;
            } else {
                password.valid = true;
                password.err = "";
            }

            if (password1.value !== password.value) {
                password1.valid = false;
                password1.err = "密码不匹配";
                ok = false;
            } else {
                password1.valid = true;
                password1.err = "";
            }



            if (ok) {
                var data = new FormData(this.$refs.form);
                fetch("/user/chpsw", {
                    method: "POST",
                    body: data,
                })
                    .then((res) => res.json())
                    .then((res) => {
                        console.log(res);
                        if (res.ok) {
                            this.showChpswModal = false;
                        } else {
                            if (res.err) {
                                for (let e of res.err) {
                                    this.inputItems[e.param].valid = false;
                                    this.inputItems[e.param].err = e.msg;
                                }
                            } else {
                                console.log(res);
                            }
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.container-userprofile {
    // position: relative;
    overflow: auto;

    table {
        background: #7c6c3769;
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
        color: #e2b842;
        font-size: 0.85em;
        font-weight: 600;
        padding: 0.5em 1em;
        text-align: left;
    }
    td {
        color: #fff;
        font-weight: 400;
        padding: 0.65em 1em;
        &:first-child {
            text-align: right;
            color: black;
        }
        &:last-child {
            text-align: left;
        }
    }
    .disabled td {
        color: #4f5f64;
    }
}
.form {
    padding: 30px 40px;
    .form-control {
        margin-bottom: 10px;
        padding-bottom: 20px;
        position: relative;
        text-align: left;
        span {
            user-select: none;
            position: absolute;
            top: 33px;
            right: 6px;
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
</style>