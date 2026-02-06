import { HashRouter } from "inferno-router";
import AppRoutes from "./routes";

export default function App() {
    return (
        <HashRouter>
            <AppRoutes />
        </HashRouter>
    );
}
