import "./css/confirmation.css"


export default function Confirmation({message, state, setState, action}){
    if (!state) return null;
    return (<div className="confirmation">
                <div className="confirmationContainer">
                    <h1>Are you sure you want to {message}?</h1>
                    <div className="buttonsContainer">
                        <button className="cancel" onClick={()=>setState(prev=>!prev)}>Cancel</button>
                        <button className="confirm" onClick={()=>{
                            action();
                            setState(prev=>!prev);
                        }}>Confirm</button>
                    </div>
                </div>
            </div>
    )
}