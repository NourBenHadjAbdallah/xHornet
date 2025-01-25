import React, { useState } from "react";
/*import css file*/
import applicationLogo from "../resources/application_logo.png";
import "../css/login.css";
/*import icons from resources*/
import passwordShowIcon from "../resources/password_show_icon_white.png";
import passwordHideIcon from "../resources/password_hide_icon_white.png";
import Alert from "@material-ui/lab/Alert";
import Loading from "./Loading";
import configData from "../helpers/config.json";
/*login.js is the component that give to user the access to the application*/
const Login = () => {
  // Initialize a boolean state
  const [passwordShown, setPasswordShown] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password toggle handler
  const togglePassword = () => {
    // When the handler is invoked
    // inverse the boolean state of passwordShown
    setPasswordShown(!passwordShown);
  };
  //const history = useHistory();
  const submitHandler = async (e) => {
    // const {data} = await axios.post("/api/users/login",
    // {}
    // ,config
    // )
    // var body = {
    //     name: name,
    //     password: password
    // }

    // make axios post request
    e.preventDefault();

    if (name === configData.USER_1.LOGIN && password === configData.USER_1.PASSWORD) {
      setLoading(true);
      setError(false);
    } else setError(true);
    //   try{
    //          await axios({
    //         method: "post",
    //         url: "/api/users/login",
    //         data: body,
    //         headers: {
    //             'Accept': 'application/json, text/plain, */*',
    //             'Content-Type': 'application/json'
    //           },
    //       })
    //       //navigate('/formulaire');
    //      // history.push("/formulaire");
    //       //     setError(false)
    //   }
  };
  return (
    <>
      {error && (
        <Alert variant="filled" severity="error">
          Vous avez saisi des données invalides. Veuillez réessayer.
        </Alert>
      )}

      {/* {error && <ErrorMessage variant="danger">{error}</ErrorMessage>} */}

      {/* <div className="login-section"> */}
      {loading ? (
        <Loading></Loading>
      ) : (
        <>
          <section className="split left">
            <img className="application-logo" src={applicationLogo} alt="" />
          </section>
          <section className="split right">
            <div className="login-section">
              <h1 className="title-style">Connexion</h1>

              <form>
                <input
                  className="username-field input"
                  type="text"
                  name="username"
                  placeholder="Nom de l'utilisateur"
                  required="required"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  className="password-field input"
                  type={passwordShown ? "text" : "password"}
                  name="password"
                  placeholder="Mot de passe"
                  required="required"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <img
                  className="password-icon"
                  src={passwordShown ? passwordShowIcon : passwordHideIcon}
                  alt=""
                  onClick={togglePassword}
                />

                <button className="submit-button" onClick={submitHandler}>
                  Se connecter
                </button>
              </form>
              {/* </div> */}
            </div>
          </section>
        </>
      )}
    </>
  );
};

export default Login;
