import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import headless from "./headless-engine";
import "vuetify/lib/styles/main.css";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";

const app = createApp(App);
const vuetify = createVuetify({ components });

app.use(vuetify);
app.use(router);
app.use(headless);

app.mount("#app");
