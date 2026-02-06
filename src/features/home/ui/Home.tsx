import { Link } from "inferno-router";
import FlashlightOverlay from "./components/FlashlightOverlay";
import { withBase } from "src/shared/base";

export default function Home() {
    return (
        <section className="relative w-screen h-dvh overflow-hidden bg-[url('/images/door-security.png')] xl:bg-[url('/images/door.png')] bg-left bg-center bg-cover bg-no-repeat">
    
            <FlashlightOverlay nightStartHour={19} nightEndHour={7} />

            <Link className="group terminalLink absolute inline-block left-(--home-terminal-link-left) bottom-(--home-terminal-link-bottom)" to={withBase("/logs")} aria-label="Ouvrir le terminal">
                <img className="
                block w-auto h-[80dvh] 2xl:min-h-[40.5vmax]
                cursor-pointer transition-transform transition-filter duration-200
                group-hover:scale-[1.01] group-hover:brightness-110
                
                [@media(hover:none)]:[animation:var(--zoom-bright)]
                " src="images/terminal.png" alt="Terminal" />
            </Link>
            <Link className="group securityLink hidden xl:inline-block absolute right-[23vw] bottom-[40.5vh]" to={withBase("/r8a2")} aria-label="Voir la sécurité">
                <img className="
                block w-[10dvw] h-auto
                cursor-pointer transition-transform transition-filter duration-200
                group-hover:scale-[1.01] group-hover:brightness-110

                [@media(hover:none)]:[animation:var(--zoom-bright)]
                " src="images/security.png" alt="Security" />
            </Link>
        </section>
    );
}