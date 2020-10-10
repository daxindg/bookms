<template>
    <!-- <button @click="expanded = !expanded">Collapse</button> -->
    <div class="collapse-container" :class="{ expand: expand }" ref="cont">
        <slot></slot>
    </div>
</template>


<script>
export default {
    name: "Collapse",
    props: {
        isExpand: Boolean,
        // title: String,
        // expandAll: Boolean,
    },
    computed: {
        expand() {
            if (this.isExpand === true) {
                this.expandContent(this.$refs.cont);
            } else if (this.isExpand === false) {
                this.collapseContent(this.$refs.cont);
            }
            // console.log(this.isExpand);
            return this.isExpand;
        },
    },
    methods: {
        expandContent(element) {
            if (element === undefined) return;
            var height = element.scrollHeight;

            element.style.height = height + "px";
            element.addEventListener("transitionend", function wtf() {
                element.removeEventListener("transitionend", wtf);
                // element.style.height = null;
            });
        },
        collapseContent(element) {
            if (element === undefined) return;

            var height = element.scrollHeight;
            var elementTransition = element.style.transition;
            element.style.transition = "";

            requestAnimationFrame(function () {
                element.style.height = height + "px";
                element.style.transition = elementTransition;
                requestAnimationFrame(function () {
                    element.style.height = 0 + "px";
                });
            });
        },
    },
};
</script>

<style lang="scss" scoped>
.collapse-container {
    &.ovfh {
        overflow: hidden;
    }

    // background-color: rgba(224, 226, 94, 0.644);
    border-top: solid 1px darkgray;
    display: block;
    height: 0;
    opacity: 0;
    pointer-events: none;
    transition: height 0.5s ease-in-out, opacity  0.3s ease-in,
            border 0.5s ease-in-out;

    &.expand {
        opacity: 1;
        pointer-events: auto;
        transition: height 0.5s ease-in-out, opacity 0.3s 0.5s ease-in,
            border 0.5s ease-in-out;
    }
}
</style>