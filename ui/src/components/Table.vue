<template>
    <div class="table-container">
        <table>
            <thead>
                <tr>
                    
                    <th>作者</th>
                    <th
                        v-for="(key, idx) in columns"
                        :key="idx"
                        @click="sortBy(key.val)"
                        :class="{ active: sortKey == key.val }"
                    >
                        {{ key.name }}
                        <span
                            class="arrow"
                            :class="sortOrders[key.val] > 0 ? 'asc' : 'dsc'"
                        >
                        </span>
                    </th>
                    
                </tr>
            </thead>
            <tbody>
                <tr v-for="(entry, idx) in filteredRows" :key="idx">
                    <td>
                        {{entry.title}}
                    </td>
                                        <td>
                        <author-tool :bid="entry.bid" :textview="true" />
                    </td>
                    <td v-for="(key, idx) in columns" :key="idx">
                        <span
                            v-if="key.val === 'class'"
                            class="class"
                            :class="entry[key.name]"
                            @click="setClass(entry.uid)"
                            >{{ entry[key] }}</span
                        >
                        <span v-else>{{ entry[key.val] }}</span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>


<script>
import TagTool from "./TagTool";
import AuthorTool from "./AuthorTool";

export default {
    name: "Table",
    components: {
        TagTool,
        AuthorTool,
    },
    props: {
        rows: Array,
    },
    data() {
        return {
            sortKey: "",
            filterKey: "",
            sortOrders: {},
            columns: [
                {
                    name: "书名",
                    val: "title",
                },
                {
                    name: "出版社",
                    val: "pub",
                },
                {
                    name: "出版年",
                    val: "year",
                },
                {
                    name: "ISBN",
                    val: "isbn",
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
            ],
        };
    },
    computed: {
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
    methods: {
        sortBy(key) {
            this.sortKey = key;
            this.sortOrders[key] = this.sortOrders[key] * -1;
        },
    },
};
</script>


<style lang="scss" scoped>
.table-container {
    // position: relative;
    overflow: auto;

    table {
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
        color: rgb(0, 0, 0);
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