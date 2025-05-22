import {useState} from "react";
import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import TopBar from "./components/topBar";
import "./css/profile.css";
import "./css/layout1.css";

export default function profile(){
    const [user, setUser] = useState({userName: "No user", email:"No email"});
    const navigate = useNavigate();

    //logs user out
    async function fetchLogout(event){
        event.preventDefault();

        let res = await fetch("/logout");
        res = await res.json();
        if(res.logout){
            navigate("/login");
        }
        else{
            console.log("we couldn't logout");
        }
    }

    //fetch session data
    useEffect(()=>{
        async function fetchSession(){
            let res = await fetch("/session");
            res = await res.json();
            setUser(res.user);
        }
        fetchSession();
    },[])

    let header = "Your Profile"
    return(
        <div className = "wholePage">
            <TopBar header={header} />

            <div class="profileContainer">
                <h1>
                    Welcome {user.userName}
                </h1>
                <div class="profileDetails">
                    <ul>
                            <li>Username: {user.userName}</li>
                            <li>Email: {user.email}</li>
                    </ul>
                </div>

                <div class="logout">
                    <form onSubmit={fetchLogout}>
                        <input type="submit" value="Log Out"/>
                    </form>
                </div>
            </div>
        </div>
    );
}