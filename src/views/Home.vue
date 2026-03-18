<script setup>
import MiiViewer from '@/components/home/MiiViewer.vue';
import ProfilePicture from '@/components/home/ProfilePicture.vue';
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
                        <button class="btn-projects">Projects</button>
                        <a href="https://github.com/mathiiiiiis" target="_blank" class="btn-icon">
                            <svg class="icon"><use href="#icon-github" /></svg>
                        </a> 
                        <a href="https://discord.com/users/1377301109827174660" target="_blank" class="btn-icon discord">
                            <svg class="icon"><use href="#icon-discord" /></svg>
                        </a>
                    </section>
                </div>
            </div>
            <section class="card tech-stack">
            </section>
        </div>
        <div class="right">
            <section  class="card about-me">
                <h2 class="about-me-title">ABOUT<span>ME</span></h2>
                <p>Hello, I'm mathis, a 16-year-old, living in Germany.
                    I started coding when I was 13 and now mostly work on OSS Projects.</p>
                <p>Currently building Sono, a local music player for Android.</p>
                <p>Apart from coding I'm also listening to music or do drawing.
                   Big fan of Ye, Gorillaz and MF DOOM.
                </p>
                <span class="about-me-tag">// mathis</span>
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
    height: 292px;
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
    height: 70px;
    display: flex;
    align-items: center;
    gap: 6px;
}

.btn-projects {
    flex: 1;
    height: 100%;
    border-radius: 25px;
    border: none;
    background: var(--button-primary);
    color: var(--button-text);
    font-family: var(--font-secondary);
    font-size: 16px;
    font-weight: 600;
    font-size: 22px;
    cursor: pointer;
    transition: opacity var(--transition-fast);
}

.btn-projects:hover {
    opacity: 0.85;
}

.btn-icon {
    width: 70px;
    height: 100%;
    border-radius: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--icon-bg);
    cursor: pointer;
}

.btn-projects,
.btn-icon {
    transition: opacity var(--transition-fast), transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.btn-projects:hover,
.btn-icon:hover {
    opacity: 0.85;
}

.btn-projects:active,
.btn-icon:active {
    transform: scale(0.92);
}

.btn-icon .icon {
    width: 45px;
    height: 45px;
}

.btn-icon.discord {
    background: #5865F2;
}

/* ==== ABOUT ME ==== */
.about-me {
    width: 394px;
    height: 481px;
    border-radius: 25px 50px 25px 25px;
    padding: 24px;
    font-family: var(--font-secondary);
    display: flex;
    flex-direction: column;
}

.about-me-title {
    font-family: var(--font-primary);
    font-weight: 300;
    text-transform: uppercase;
    margin-bottom: 20px;
    font-size: 22px;
}

.about-me-title span {
    font-weight: 700;
    font-size: 34px;
}

.about-me p {
    color: var(--text-secondary);
    line-height: 1.6;
}

.about-me-tag {
    margin-top: auto;
    color: var(--card-border);
    font-family: var(--font-secondary);
    font-size: 14px;
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