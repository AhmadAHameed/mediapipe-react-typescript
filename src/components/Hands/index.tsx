import { useEffect, useRef, useState } from 'react';
import { Results, Hands, HAND_CONNECTIONS, VERSION } from '@mediapipe/hands';
import {
    drawConnectors,
    drawLandmarks,
    Data,
    lerp,
} from '@mediapipe/drawing_utils';
import './index.scss';

const HandsContainer = () => {
    const [inputVideoReady, setInputVideoReady] = useState(false);
    const [loaded, setLoaded] = useState(false);

    const inputVideoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);

    const initializeMediaPipe = (hands: Hands) => {
        hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });

        hands.onResults(onResults);
    };

    const getUserMedia = async () => {
        if (inputVideoRef.current) {
            const constraints = {
                video: { width: { min: 1280 }, height: { min: 720 } },
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            inputVideoRef.current.srcObject = stream;
        }
    };

    const sendToMediaPipe = async (hands: Hands) => {
        if (inputVideoRef.current && inputVideoRef.current.videoWidth) {
            await hands.send({ image: inputVideoRef.current });
        }
        requestAnimationFrame(() => sendToMediaPipe(hands));
    };

    const onResults = (results: Results) => {
        if (canvasRef.current && contextRef.current) {
            setLoaded(true);

            const context = contextRef.current;
            context.save();
            context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            context.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

            if (results.multiHandLandmarks && results.multiHandedness) {
                results.multiHandLandmarks.forEach((landmarks, index) => {
                    const classification = results.multiHandedness[index];
                    const isRightHand = classification.label === 'Right';
                    const color = isRightHand ? '#00FF00' : '#FF0000';
                    const fillColor = isRightHand ? '#FF0000' : '#00FF00';

                    drawConnectors(context, landmarks, HAND_CONNECTIONS, { color });
                    drawLandmarks(context, landmarks, {
                        color,
                        fillColor,
                        radius: (data: Data) => lerp(data.from!.z!, -0.15, 0.1, 10, 1),
                    });
                });
            }

            context.restore();
        }
    };

    useEffect(() => {
        if (!inputVideoReady) return;

        if (inputVideoRef.current && canvasRef.current) {
            contextRef.current = canvasRef.current.getContext('2d');

            if (contextRef.current) {
                const hands = new Hands({
                    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${VERSION}/${file}`,
                });

                initializeMediaPipe(hands);
                getUserMedia().then(() => sendToMediaPipe(hands));
            }
        }
    }, [inputVideoReady]);

    return (
        <div className="mediapipe-container">
            <video
                autoPlay
                ref={(el) => {
                    inputVideoRef.current = el;
                    setInputVideoReady(!!el);
                }}
            />
            <canvas ref={canvasRef} width={1280} height={720} />
            {!loaded && (
                <div className="loading">
                    <div className="spinner"></div>
                    <div className="message">Loading</div>
                </div>
            )}
        </div>
    );
};

export default HandsContainer;
