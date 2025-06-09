import React, { useState } from "react";
/*import css file*/
import appLogo from "../../resources/app_logo.png";
import "../Login/loginStyle.css";
/*import icons from resources*/
import passwordShowIcon from "../../resources/password_show_icon_white.png";
import passwordHideIcon from "../../resources/password_hide_icon_white.png";
import Alert from "@material-ui/lab/Alert";
import Loading from "../Loading/Loading";
import configData from "../../helpers/config.json";
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
    setPasswordShown(!passwordShown);
  };
  const submitHandler = async (e) => {

    e.preventDefault();

    if (name === configData.USER_1.LOGIN && password === configData.USER_1.PASSWORD) {
      setLoading(true);
      setError(false);
    } else setError(true);

  };
  return (
    <>
      {error && (
        <Alert variant="filled" severity="error">
          Vous avez saisi des données invalides. Veuillez réessayer.
        </Alert>
      )}


      {loading ? (
        <Loading></Loading>
      ) : (
        <>
          <section className="split left">
            <img className="application-logo" src={appLogo} alt="" />
          </section>
          <section className="split right">
            <div className="login-section">
              <h1 className="title-style">Connexion</h1>

              <form>
                <input
                  className="username-field"
                  type="text"
                  name="username"
                  placeholder="Nom de l'utilisateur"
                  required="required"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  className="password-field"
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
            </div>
          </section>
        </>
      )}
    </>
  );
};

export default Login;
