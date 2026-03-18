<script setup>
import MiiViewer from '@/components/MiiViewer.vue';
import ProfilePicture from '@/components/ProfilePicture.vue';
</script>

<template>
    <div class="home">
        <div class="left">
            <div class="left-top">
                <section class="card mii-viewer">
                    <MiiViewer />
                </section>
                <div class="left-top-right">
                    <section class="card about-short">
                        <div class="about-short-header">
                            <ProfilePicture />
                            <div class="about-short-content">
                                <h3>Hello I'm</h3>
                                <h1>mathis</h1>
                            </div>
                        </div>
                        <div class="about-short-description">
                            <h5>A 16-year-old software dev based in Germany.</h5>
                        </div>
                    </section>
                    <section class="button-row">
                    </section>
                </div>
            </div>
            <section class="card tech-stack">
            </section>
        </div>
        <div class="right">
            <section  class="card about-me">
            </section>
            <section class="card last-played">
            </section>
        </div>
    </div>
</template>

<style lang="css" scoped>
.home {
    display: flex;
    gap: 16px;
    justify-content: center;
    align-items: center;
    height: 100dvh;
}

.left {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.left-top {
    display: flex;
    gap: 16px
}

.left-top-right {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-top: 48px;
}

.right {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-top: 48px;
}

.card {
    background-color: var(--card-bg);
    border: solid 2px var(--card-border);
    box-sizing: border-box;
}

/* ==== MII VIEWER ==== */

.mii-viewer {
    width: 288px;
    height: 426px;
    border-radius: 50px 25px 25px 25px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.mii-viewer :deep(.mii-container) {
    transform: scale(1.15) translateY(-10px);
}

/* ==== ABOUT SHORT ==== */
.about-short {
    width: 450px;
    height: 265px;
    border-radius: 25px;
    padding: 15px;
    display: flex;
    flex-direction: column;
}

.about-short-header {
    display: flex;
    align-items: center;
    gap: 16px;
}

.about-short-content h3,
.about-short-description h5 {
    font-weight: 300;
    color: var(--text-secondary);
}

.about-short-description {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* ==== BUTTON ROW ==== */

.button-row {
    width: 450px;
    height:70px;
    display: flex;
    align-items: center;
    gap: 12px;
}


/* ==== ABOUT ME ==== */
.about-me {
    width: 394px;
    height: 481px;
    border-radius: 25px 50px 25px 25px;
    padding: 24px
}


/* ==== TECH STACK ==== */
.tech-stack {
    width: 100%;
    height: 164px;
    border-radius: 25px 25px 50px 50px;
    padding: 24px;
}

/* ==== LAST PLAYED ==== */
.last-played {
    width: 394px;
    height: 170px;
    border-radius: 25px 25px 50px 50px;
    padding: 16p;
}
</style>