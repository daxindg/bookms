<template>
    <div class="modal-mask" v-if="show_modal" @click="$emit('close')">
        <div class="modal">
            <div class="modal-body" @click.stop>
                <div class="header">
                    <h5 class="title">{{ title }}</h5>
                    <slot name="header"></slot>
                    <div class="btn-close-wrapper">
                        <span class="btn-close" @click="$emit('close')">
                            &times;
                        </span>
                    </div>
                </div>
                <div class="content">
                    <slot></slot>
                </div>
                <div class="footer">
                    <slot name="footer"></slot>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "Modal",

    props: {
        showModal: Boolean,
        title: String,
    },
    computed: {
        show_modal() {
            return this.showModal;
        },
    },
};
</script>


<style lang="scss" scoped>
.modal-mask {
    z-index: 998;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: table;
    &.large {
        ::v-deep(.modal-body) {
            max-width: 40em;
        }
    }
    &.auto {
        display: flex;
    }
    &.small {
        ::v-deep(.modal-body) {
            max-width: 27em;
        }
    }
    .modal {
        display: table-cell;
        vertical-align: middle;
        margin: auto;
        max-width: 100vw;
        .modal-body {
            border: solid 1px rgba(240, 145, 216, 0.3);
            background-color: rgba(255, 245, 238, 0.815);
            border-radius: 4px;
            margin: auto;
            transition: all 1s ease-in-out;
            .header {
                display: flex;
                justify-content: space-between;
                background-color: rgba(255, 245, 238, 0.815);
                .title {
                    margin: 1em 3em;
                    font-size: 1em;
                }
                .btn-close-wrapper {
                    display: inline-flex;
                    align-items: center;
                    .btn-close:hover {
                        color: red;
                        /* transition: all 1s ease-in-out; */
                    }
                    .btn-close {
                        padding-right: 5px;
                        font-size: 2em;
                        cursor: pointer;
                        transition: all 0.5s ease-in-out;
                        /* pointer-events: ; */
                    }
                }
            }
            .content {
                max-height: 80vh;

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
            }
            .footer {
                text-align: center;
                background-color: rgba(255, 245, 238, 0.815);
                padding: 0.5em;
            }
        }
    }
}
</style>