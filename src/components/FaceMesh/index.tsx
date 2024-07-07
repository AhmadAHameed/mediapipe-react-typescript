import { useEffect, useRef, useState } from "react"
import { FACEMESH_FACE_OVAL, FACEMESH_LEFT_EYE, FACEMESH_LEFT_EYEBROW, FACEMESH_LEFT_IRIS, FACEMESH_LIPS, FACEMESH_RIGHT_EYE, FACEMESH_RIGHT_EYEBROW, FACEMESH_RIGHT_IRIS, FACEMESH_TESSELATION, FaceMesh, Results } from "@mediapipe/face_mesh"
import "./index.scss"
import { drawConnectors } from "@mediapipe/drawing_utils"


const FaceMeshContainer = () => {
    const [inputVideoReady, setInputVideoReady] = useState<boolean>(false)
    const [loaded, setLoaded] = useState<boolean>(false)

    const inputVideoRef = useRef<HTMLVideoElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const contextRef = useRef<CanvasRenderingContext2D | null>(null)

    const initializeMediaPipe = (face_mesh: FaceMesh) => {
        face_mesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: false,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        })

        face_mesh.onResults(onResults)
    }

    const getUserMedia = async () => {
        if (inputVideoRef.current) {
            const constraints = {
                video: { width: { min: 1280 }, height: { min: 720 } }
            }
            const stream = await navigator.mediaDevices.getUserMedia(constraints)
            inputVideoRef.current.srcObject = stream
        }
    }

    const sendToMediaPipe = async (facemesh: FaceMesh) => {
        if (inputVideoRef.current && inputVideoRef.current.videoWidth) {
            await facemesh.send({ image: inputVideoRef.current })
        }
        requestAnimationFrame(() => sendToMediaPipe(facemesh))
    }

    const onResults = (results: Results) => {
        if (canvasRef.current && contextRef.current) {
            setLoaded(true)
            const context = contextRef.current
            context.save()
            context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
            context.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height)

            if (results.multiFaceLandmarks) {
                for (const landmarks of results.multiFaceLandmarks) {
                    drawConnectors(context, landmarks, FACEMESH_TESSELATION,
                        { color: '#C0C0C070', lineWidth: 1 });
                    drawConnectors(context, landmarks, FACEMESH_RIGHT_EYE, { color: '#FF3030' });
                    drawConnectors(context, landmarks, FACEMESH_RIGHT_EYEBROW, { color: '#FF3030' });
                    drawConnectors(context, landmarks, FACEMESH_RIGHT_IRIS, { color: '#FF3030' });
                    drawConnectors(context, landmarks, FACEMESH_LEFT_EYE, { color: '#30FF30' });
                    drawConnectors(context, landmarks, FACEMESH_LEFT_EYEBROW, { color: '#30FF30' });
                    drawConnectors(context, landmarks, FACEMESH_LEFT_IRIS, { color: '#30FF30' });
                    drawConnectors(context, landmarks, FACEMESH_FACE_OVAL, { color: '#E0E0E0' });
                    drawConnectors(context, landmarks, FACEMESH_LIPS, { color: '#E0E0E0' });
                }
            }
            context.restore()
        }
    }

    useEffect(() => {
        if (!inputVideoReady) return;
        if (inputVideoRef.current && canvasRef.current) {
            contextRef.current = canvasRef.current.getContext("2d")

            if (contextRef.current) {
                const face_mesh = new FaceMesh({
                    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
                })

                initializeMediaPipe(face_mesh)
                getUserMedia().then(() => sendToMediaPipe(face_mesh))
            }
        }
    })

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


}
export default FaceMeshContainer