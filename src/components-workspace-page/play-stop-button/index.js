import React from "react";
import PropTypes from "prop-types";
import { animated, Spring } from "react-spring";
import { interpolate } from "flubber";

const PlayPause = React.memo(function PlayPause({ buttonToShow }) {
    const playPath = "M3 22v-20l18 10-18 10z";
    const pausePath = "M11 22h-4v-20h4v20z";
    const [nextPath, currentPath] =
        buttonToShow === "play" ? [pausePath, playPath] : [playPath, pausePath];
    const interpolator = interpolate(nextPath, currentPath, {
        maxSegmentLength: 0.1
    });
    const pauseFull = "M17 22h-4v-20h4v-20z";
    const pauseEmpty =
        "M7.26274645,12.6635515 C7.26274645,13.4126534 6.94859678,12.5187543 7.00731285,12.6635515 C7.18860321,13.1106239 7.84805291,12.5509389 7.26274645,12.103737 C7.02916666,11.925271 7.26274645,12.103737 7.00731285,12.446144 C6.97368062,12.4912277 7.05882516,12.6387618 7.26274645,12.8887463";

    const [pNextPath, pCurrentPath] =
        buttonToShow === "play" ? [pauseFull, pauseEmpty] : [pauseEmpty, pauseFull];
    const pauseInterpolator = interpolate(pNextPath, pCurrentPath);
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="20"
            viewBox="0 0 24 24"
        >
            <Spring reset native from={{ t: 0 }} to={{ t: 1 }}>
                {({ t }) => (
                    <g fill={"#fff"}>
                        <animated.path d={t.interpolate(interpolator)} />
                        <animated.path
                            d={t.interpolate(pauseInterpolator)}
                            style={{
                                opacity: t
                            }}
                        />
                    </g>
                )}
            </Spring>
        </svg>
    );
});

PlayPause.propTypes = {
    buttonToShow: PropTypes.oneOf(["play", "pause"])
};

PlayPause.defaultProps = {
    buttonToShow: "play"
};

export default PlayPause;