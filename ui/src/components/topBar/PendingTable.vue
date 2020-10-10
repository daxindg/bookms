<template>
    <modal :show-modal="show" class="auto" :title="title">
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th @click="sortTable('username')">用户名</th>
                        <th @click="sortTable('title')">书名</th>
                        <th @click="sortTable('stime')">借书时间</th>
                        <th @click="sortTable('ddl')">应还时间</th>
                        <th @click="sortTable('status')">状态</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(it, idx) in rows" :key="idx">
                        <td>{{ idx }}</td>
                        <td>{{ it.username }}</td>
                        <td>{{ it.title }}</td>

                        <td>{{ it.stime }}</td>
                        <td>{{ it.ddl }}</td>
                        <td>
                            <span class="status" :class="it.status">{{
                                it.status
                            }}</span>
                        </td>
                        <td>
                            <button
                                class="button"
                                @click="acceptRequest(it.brid)"
                            >
                                同意
                            </button>
                            <button
                                class="button"
                                @click="rejectRequest(it.brid)"
                            >
                                拒绝
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </modal>
</template>

<script>
import Modal from "../Modal";

export default {
    name: "PendingTable",
    props: {
        show: Boolean,
    },
    components: {
        Modal,
    },
    data() {
        return {
            rows: [],
            title: "Loading",
            ascending: false,
            sortColumn: "",
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
            fetch("/api/borrow/pending/", {
                method: "GET",
            })
                .then((res) => res.json())
                .then((res) => {
                    if (res.ok) {
                        this.rows = res.data;
                        this.title = `待审核`;
                    }
                })
                .catch((err) => console.log(err));
        },
        sortTable(col) {
            if (this.sortColumn === col) {
                this.ascending = !this.ascending;
            } else {
                this.ascending = true;
                this.sortColumn = col;
            }

            var ascending = this.ascending;

            this.rows.sort(function (a, b) {
                if (a[col] > b[col]) {
                    return ascending ? 1 : -1;
                } else if (a[col] < b[col]) {
                    return ascending ? -1 : 1;
                }
                return 0;
            });
        },
        acceptRequest(brid) {
            fetch(`/api/borrow/accept/${brid}`, {
                method: "POST",
            })
                .then((res) => res.json())
                .then((res) => {
                    if (res.ok) {
                        this.rows = this.rows.filter((e) => e.brid !== brid);
                    }
                })
                .catch((err) => console.log(err));
        },
        rejectRequest(brid) {
            fetch(`/api/borrow/reject/${brid}`, {
                method: "POST",
            })
                .then((res) => res.json())
                .then((res) => {
                    if (res.ok) {
                        this.rows = this.rows.filter((e) => e.brid !== brid);
                    }
                })
                .catch((err) => console.log(err));
        },
    },
};
</script>

<style lang="scss" scoped>
.table-container {
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
        text-align: center;
        cursor: pointer;

        &:first-child {
            text-align: right;
        }
        &:last-child {
            text-align: left;
        }
    }
    td {
        color: #fff;
        font-weight: 400;
        padding: 0.65em 1em;
        text-align: center;
        &:first-child {
            text-align: right;
            color: black;
        }
        &:last-child {
            text-align: left;
        }
        .status {
            border-radius: 0.5em;
            padding: 0.2em 0.6em;
            overflow: hidden;
            box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2),
                0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
            &.ok {
                background-color: rgb(1, 138, 184);
            }
            &.pending_borrow,
            &.pending_return {
                background-color: rgb(167, 94, 4);
            }
            &.returned {
                background-color: rgb(64, 126, 3);
            }
            &.overtime {
                background-color: firebrick;
            }
        }
        .button {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            border: none;
            border-radius: 4px;

            min-width: 64px;
            height: 1.5rem;

            text-align: center;
            text-overflow: ellipsis;
            text-transform: uppercase;
            color: rgb(var(--pure-material-onprimary-rgb, 255, 255, 255));
            background-color: rgb(
                var(--pure-material-primary-rgb, 33, 150, 243)
            );
            box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2),
                0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
            font-family: var(
                --pure-material-font,
                "Roboto",
                "Segoe UI",
                BlinkMacSystemFont,
                system-ui,
                -apple-system
            );
            font-size: 14px;
            font-weight: 500;
            line-height: 36px;
            overflow: hidden;
            outline: none;
            cursor: pointer;
            transition: box-shadow 0.2s;

            &::-moz-focus-inner {
                border: none;
            }

            /* Overlay */
            &::before {
                content: "";
                position: absolute;
                top: 0;
                bottom: 0;
                left: 0;
                right: 0;
                background-color: rgb(
                    var(--pure-material-onprimary-rgb, 255, 255, 255)
                );
                opacity: 0;
                transition: opacity 0.2s;
            }

            /* Ripple */
            &::after {
                content: "";
                position: absolute;
                left: 50%;
                top: 50%;
                border-radius: 50%;
                padding: 50%;
                width: 32px; /* Safari */
                height: 32px; /* Safari */
                background-color: rgb(
                    var(--pure-material-onprimary-rgb, 255, 255, 255)
                );
                opacity: 0;
                transform: translate(-50%, -50%) scale(1);
                transition: opacity 1s, transform 0.5s;
            }

            /* Hover, Focus */
            &:hover,
            &:focus {
                box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.2),
                    0 4px 5px 0 rgba(0, 0, 0, 0.14),
                    0 1px 10px 0 rgba(0, 0, 0, 0.12);
            }

            &:hover::before {
                opacity: 0.08;
            }

            &:focus::before {
                opacity: 0.24;
            }

            &:hover:focus::before {
                opacity: 0.3;
            }

            /* Active */
            &:active {
                box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
                    0 8px 10px 1px rgba(0, 0, 0, 0.14),
                    0 3px 14px 2px rgba(0, 0, 0, 0.12);
            }

            &:active::after {
                opacity: 0.32;
                transform: translate(-50%, -50%) scale(0);
                transition: transform 0s;
            }

            /* Disabled */
            &:disabled {
                color: rgba(var(--pure-material-onsurface-rgb, 0, 0, 0), 0.38);
                background-color: rgba(
                    var(--pure-material-onsurface-rgb, 0, 0, 0),
                    0.12
                );
                box-shadow: none;
                cursor: initial;
            }

            &:disabled::before {
                opacity: 0;
            }

            &:disabled::after {
                opacity: 0;
            }
        }
    }
    .disabled td {
        color: #4f5f64;
    }
}
</style>