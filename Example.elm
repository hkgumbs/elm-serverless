port module Main exposing (..)

import Json.Decode


type alias Model =
    ()


type alias Msg =
    ()


port done : { code : Int, body : String } -> Cmd msg


init : a -> ( Model, Cmd Msg )
init _ =
    ( ()
    , done { code = 200, body = "Hello, from Elm!" }
    )


update : Model -> Msg -> ( Model, Cmd Msg )
update _ _ =
    ( ()
    , Cmd.none
    )


main : Platform.Program { event : Int } Model Msg
main =
    Platform.programWithFlags
        { init = init
        , update = update
        , subscriptions = \_ -> Sub.none
        }
