<template>
    <modal :show-modal="show" class="auto" :title="title">
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th
                            v-for="(key, idx) in columns"
                            :key="idx"
                            @click="sortBy(key)"
                            :class="{ active: sortKey == key }"
                        >
                            {{ key }}
                            <span
                                class="arrow"
                                :class="sortOrders[key] > 0 ? 'asc' : 'dsc'"
                            >
                            </span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(entry, idx) in filteredRows" :key="idx">
                        <td v-for="(key, idx) in columns" :key="idx">
                            <span
                                v-if="key === 'class'"
                                class="class"
                                :class="entry[key]"
                                @click="setClass(entry.uid)"
                                >{{ entry[key] }}</span
                            >
                            <span v-else>{{ entry[key] }}</span>
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
    name: "UserTable",
    components: {
        Modal,
    },
    props: {
        show: Boolean,
    },
    data() {
        return {
            rows: [],
            title: "Loading",
            sortKey: "uid",
            filterKey: "",
            sortOrders: {},
        };
    },
    computed: {
        columns() {
            return Object.keys(this.rows[0] || {});
        },
        filteredRows() {
            var sortKey = this.sortKey;
            var filterKey = this.filterKey.trim();
            var order = this.sortOrders[sortKey] || 1;
            var rows = this.rows;
            if (filterKey.length > 0) {
                rows = rows.filter(function (row) {
                    return Object.keys(row).some(function (key) {
                        return (
                            String(row[key]).toLowerCase().indexOf(filterKey) >
                            -1
                        );
                    });
                });
            }
            if (sortKey) {
                rows = rows.slice().sort(function (a, b) {
                    a = a[sortKey];
                    b = b[sortKey];
                    return (a === b ? 0 : a > b ? 1 : -1) * order;
                });
            }
            return rows;
        },
    },
    watch: {
        show(val) {
            if (val === true) {
                this.fetchData();
            } else this.title = "Loading";
        },
    },
    created() {
        this.fetchData();
    },
    methods: {
        fetchData() {
            fetch("/api/user/list", {
                method: "GET",
            })
                .then((res) => res.json())
                .then((res) => {
                    if (res.ok) {
                        this.rows = res.data;
                        this.title = `用户`;
                        this.columns.forEach(
                            (key) => (this.sortOrders[key] = 1)
                        );
                    }
                })
                .catch((err) => console.log(err));
        },
        sortBy(key) {
            this.sortKey = key;
            this.sortOrders[key] = this.sortOrders[key] * -1;
        },
        setClass(uid) {
            var val = prompt(`账号类型 in ('admin', 'user', 'guest')`);
            fetch(`/api/user/setclass/${uid}/${val}`, { method: "POST" })
                .then((res) => res.json())
                .then((res) => {
                    if (res.ok) {
                        // this.rows = this.rows.map((e) => {
                        //     if (e.uid === uid) e.class = res.data.class;
                        //     return e;
                        // });
                        this.rows.filter((e) => e.uid === uid)[0].class =
                            res.data.class;
                    }
                })
                .catch((err) => alert("ERR: " + JSON.stringify(err)));
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
        font-size: 1rem;
        font-weight: 600;
        padding: 10px 20px;
        text-align: center;
        cursor: pointer;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        &:first-child {
            text-align: right;
        }
        &:last-child {
            text-align: left;
        }
        &.active {
            color: rgb(255, 255, 255);
        }

        &.active .arrow {
            opacity: 1;
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

.arrow {
    display: inline-block;
    vertical-align: middle;
    width: 0;
    height: 0;
    margin-left: 5px;
    opacity: 0.66;
}

.arrow.asc {
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-bottom: 4px solid rgb(255, 255, 255);
}

.arrow.dsc {
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 4px solid #fff;
}
</style>