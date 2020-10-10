<template>
    <nav>
        <div class="sm">
            <a class="logo">BOOkMs <small>图书借阅管理系统</small></a>
            <button class="toggle" type="button" @click="navExpand = !navExpand">
                <span class="hamburger"></span>
            </button>
        </div>

        <div class="button-group" :class="{expand:navExpand}" v-if="user.class === 'guest'">
            <button class="button" @click="toggle_login_modal = true">
                登录
            </button>
            <button class="button" @click="toggle_register_modal = true">
                注册
            </button>
        </div>
        <div class="button-group" :class="{expand:navExpand}" v-else>
            <button
                class="button"
                :class="{ lgm: user.class === 'admin' }"
                @click="showUserprofile = !showUserprofile"
            >
                {{ user.name }}
            </button>
            <button class="button" @click="showBorrowTable = !showBorrowTable">
                借阅📚
            </button>
            <template v-if="user.class === 'admin'">
                <button
                    class="button"
                    @click="showPendingTable = !showPendingTable"
                >
                    审核⏳
                </button>
                <button class="button" @click="showUserTable = true">
                    用户👥
                </button>
                <button
                    class="button"
                    @click="toggle_newbook_modal = !toggle_newbook_modal"
                >
                    新书➕
                </button>
            </template>
            <button class="button" @click="logout">
                登出
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                        d="M16 9v-4l8 7-8 7v-4h-8v-6h8zm-2 10v-.083c-1.178.685-2.542 1.083-4 1.083-4.411 0-8-3.589-8-8s3.589-8 8-8c1.458 0 2.822.398 4 1.083v-2.245c-1.226-.536-2.577-.838-4-.838-5.522 0-10 4.477-10 10s4.478 10 10 10c1.423 0 2.774-.302 4-.838v-2.162z"
                    />
                </svg>
            </button>
        </div>

    </nav>

    <modal
        class="modal-login small"
        title="登录"
        :show-modal="toggle_login_modal"
        @close="toggle_login_modal = false"
        v-if="user.class === 'guest'"
    >
        <form class="form" id="login-form" @submit.prevent="login">
            <div
                class="form-control"
                v-for="key in Object.keys(login_form).sort(
                    (a, b) => login_form[a].order - login_form[b].order
                )"
                :key="login_form[key].order"
                :class="{
                    success: login_form[key].valid === true,
                    error: login_form[key].valid === false,
                }"
            >
                <label :for="key">{{ login_form[key].label_name }}</label>
                <input
                    :type="login_form[key].type"
                    :name="key"
                    v-model="login_form[key].value"
                    autocomplete="off"
                />
                <span class="check" v-if="login_form[key].valid === true"
                    >✔️</span
                >
                <span class="cross" v-if="login_form[key].valid === false"
                    >❌</span
                >
                <small v-if="login_form[key].valid === false">{{
                    login_form[key].err
                }}</small>
            </div>
        </form>
        <template v-slot:footer>
            <material-button
                type="submit"
                form="login-form"
                :content="submiting ? '登录中' : '登录'"
                :disabled="submiting"
            />
        </template>
    </modal>
    <modal
        class="modal-register small"
        title="注册"
        :show-modal="toggle_register_modal"
        @close="toggle_register_modal = false"
        v-if="user.class === 'guest'"
    >
        <form class="form" id="register-form" @submit.prevent="register">
            <div
                class="form-control"
                v-for="key in Object.keys(register_form).sort(
                    (a, b) => register_form[a].order - register_form[b].order
                )"
                :key="register_form[key].order"
                :class="{
                    success: register_form[key].valid === true,
                    error: register_form[key].valid === false,
                }"
            >
                <label :for="key">{{ register_form[key].label_name }}</label>
                <input
                    :type="register_form[key].type"
                    :name="key"
                    v-model="register_form[key].value"
                    :autocomplete="key === 'password' ? 'new-password' : 'off'"
                />
                <span class="check" v-if="register_form[key].valid === true"
                    >✔️</span
                >
                <span class="cross" v-if="register_form[key].valid === false"
                    >❌</span
                >
                <small v-if="register_form[key].valid === false">{{
                    register_form[key].err
                }}</small>
            </div>
        </form>
        <template v-slot:footer>
            <material-button
                type="submit"
                form="register-form"
                :content="submiting ? '注册中' : '注册'"
                :disabled="submiting"
            />
        </template>
    </modal>
    <modal-new-book
        :show-modal="toggle_newbook_modal"
        @close="toggle_newbook_modal = false"
    />
    <userprofile
        v-if="showUserprofile"
        :show="showUserprofile"
        @close="showUserprofile = false"
    />
    <borrow-table
        v-if="showBorrowTable"
        :show="showBorrowTable"
        @close="showBorrowTable = false"
    />
    <pending-table
        v-if="showPendingTable"
        :show="showPendingTable"
        @close="showPendingTable = false"
    />
    <user-table
        v-if="showUserTable"
        :show="showUserTable"
        @close="showUserTable = false"
    />
</template>

<script>
import Modal from "../Modal";
import MaterialButton from "../MaterialButton";
import ModalNewBook from "./NewBookForm";
import Userprofile from "./Userprofile";
import BorrowTable from "./BorrowTable";
import PendingTable from "./PendingTable";
import UserTable from "./UserTable";

export default {
    name: "TopNavBar",
    components: {
        Modal,
        MaterialButton,
        ModalNewBook,
        Userprofile,
        BorrowTable,
        PendingTable,
        UserTable,
    },
    props: {
        user: Object,
    },
    emits: ["login", "logout"],
    data() {
        return {
            showUserprofile: false,
            showBorrowTable: false,
            showUserTable: false,
            showPendingTable: false,
            toggle_login_modal: false,
            toggle_register_modal: false,
            toggle_newbook_modal: false,
            navExpand:false,
            login_form: {
                username: {
                    order: 1,
                    label_name: "用户名",
                    type: "text",
                    value: "",
                    err: "",
                },
                password: {
                    order: 2,
                    label_name: "密码",
                    type: "password",
                    value: "",
                    err: "",
                },
            },
            register_form: {
                username: {
                    order: 1,
                    label_name: "用户名",
                    type: "text",
                    value: "",
                    err: "",
                },
                email: {
                    order: 2,
                    label_name: "邮箱",
                    type: "email",
                    value: "",
                    err: "",
                },
                password: {
                    order: 3,
                    label_name: "密码",
                    type: "password",
                    value: "",
                    err: "",
                },
                password1: {
                    order: 4,
                    label_name: "确认密码",
                    type: "password",
                    value: "",
                    err: "",
                },
            },
            submiting: false,
            // userclass: "guest",
        };
    },
    methods: {
        login(e) {
            let username = this.login_form.username;
            let ok = true;
            if (username.value.trim().length <= 0) {
                username.valid = false;
                username.err = "用户名为空";
                ok = false;
            } else {
                username.valid = true;
                username.err = "";
            }
            let password = this.login_form.password;
            if (password.value.length <= 0) {
                password.valid = false;
                password.err = "密码为空";
                ok = false;
            } else {
                password.valid = true;
                password.err = "";
            }
            if (ok) {
                var data = new FormData(e.target);
                this.submiting = true;
                fetch("/user/login", {
                    method: "POST",
                    body: data,
                })
                    .then((res) => res.json())
                    .then((res) => {
                        if (res.ok) {
                            this.$emit("login", res.data);
                            this.toggle_login_modal = false;
                        } else {
                            this.login_form[res.err.key].valid = false;
                            this.login_form[res.err.key].err = res.err.msg;
                        }
                        this.submiting = false;
                    })
                    .catch((err) => {
                        console.log(err);
                        this.submiting = false;
                    });
            }
        },
        register(e) {
            let username = this.register_form.username;
            let email = this.register_form.email;
            let password = this.register_form.password;
            let password1 = this.register_form.password1;

            let ok = true;
            if (username.value.trim().length <= 0) {
                username.valid = false;
                username.err = "用户名为空";
                ok = false;
            } else {
                username.valid = true;
                username.err = "";
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

            if (
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
                    email.value
                )
            ) {
                email.valid = true;
                email.err = "";
            } else {
                email.valid = false;
                email.err = "邮箱不合法";
                ok = false;
            }

            if (ok) {
                var data = new FormData(e.target);
                this.submiting = true;
                fetch("/user/register", {
                    method: "POST",
                    body: data,
                })
                    .then((res) => res.json())
                    .then((res) => {
                        if (res.ok) {
                            this.$emit("register", res.data);
                            this.toggle_register_modal = false;
                        } else {
                            if (res.err) {
                                for (let e of res.err) {
                                    this.register_form[e.param].valid = false;
                                    this.register_form[e.param].err = e.msg;
                                }
                            } else {
                                console.log(res);
                            }
                        }
                        this.submiting = false;
                    })
                    .catch((err) => {
                        console.log(err);
                        this.submiting = false;
                    });
            }
        },
        logout(e) {
            e.target.disabled = true;
            fetch("/user/logout", {
                method: "POST",
            })
                .then((res) => res.json())
                .then((res) => {
                    if (res.ok) {
                        this.$emit("logout");
                    }
                    e.target.disabled = false;
                })
                .catch((err) => {
                    console.log(err);
                    e.target.disabled = false;
                });
        },
    },
};
</script>


<style lang="scss" scoped>
* {
    box-sizing: border-box;
    padding: 0;
    margin: 0;
}

nav {
    text-align: left;
    background: rgba(145, 128, 110, 0.897);
    padding: 10px 20px;
    display: block;
    flex-wrap: wrap;
    align-items: center;
    .sm {
        display: flex;
        justify-content: space-between;
        align-items: center;
        // .logo {
            
        // }
    }
    
    .button-group {
        // border: 2px solid cornsilk;
        margin: 0.2em;
        // display: flex;
        flex-wrap: wrap;
        align-items: center;
        overflow: hidden;
        display: none;
        transition: opacity .4s ease-in-out;
        &.expand {
            display: flex;
            margin-top: 10px;
            justify-content: flex-end;
        }
        .button {
            display: flex;
            align-items: center;
            color: white;
            font-size: 1.1rem;
            line-height: 1em;
            padding: 0.3em;
            border: 1.5px solid cornsilk;
            border-left: none;

            outline: none;
            background-color: rgba(0, 0, 0, 0);

            transition: all 0.5s ease-in-out;
            box-sizing: border-box;
            cursor: pointer;
            // &:first-child {
            //     border-radius: .3em 0 0 .3em;

            // }
            svg {
                width: 1.1rem;
                fill: rgb(156, 31, 0);
            }
            &:first-child {
                border: 1.5px solid cornsilk;
                border-radius: 0.3em 0 0 0.3em;
            }
            &:last-child {
                border-radius: 0 0.3em 0.3em 0;
            }
            &:hover {
                background-color: cornsilk;
                color: #666;
            }
            &.lgm {
                display: block;
                background-color: #f5f5f5;
                color: red;
                &::first-letter {
                    color: black;
                }
                &:hover {
                    background-color: #ffffff;
                }
            }
        }
    }

    .toggle {
        background-color: #b3af9969;
        outline: none;
        border: solid 1px rgba(0, 0, 0, 0.2);
        border-radius: 0.3em;

        transition: background 0.5s ease-in-out;
        &:hover {
            background-color: cornsilk;
        }
        .hamburger {
            -webkit-tap-highlight-color: transparent;
            font-family: inherit;
            text-transform: none;
            font-size: 1.25rem;
            line-height: 1;
            cursor: pointer;
            color: rgba(0, 0, 0, 0.5);
            box-sizing: border-box;
            display: inline-block;
            width: 1.5em;
            height: 1.5em;
            vertical-align: middle;
            content: "";
            background: no-repeat center center;
            background-size: 100% 100%;
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%280, 0, 0, 0.5%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
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

@media all and (min-width: 606px) {
    .toggle {
        display: none;
    }
    nav {
        display: flex;
        .sm {
            flex: 1;
        }
        .button-group {
            display: flex;
        }
    }
}
</style>