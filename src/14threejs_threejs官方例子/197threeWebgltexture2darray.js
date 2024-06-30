
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/197threeWebgltexture2darray
        // --texture2darray--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_texture2darray
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 45,
                near: 0.1,
                far: 2000,
                position: [0, 0, 70]
            },
            postProcess: {
                enable: false
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        let mesh;
        
        const planeWidth = 50;
        const planeHeight = 50;
        
        let depthStep = 0.4;
        
        init();
        
        function init() {
        
        
            // width 256, height 256, depth 109, 8-bit, zip archived raw data
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            new THREE.FileLoader()
                .setResponseType( 'arraybuffer' )
                .load(assetsPath + 'textures/3d/head256x256x109.zip', function ( data ) {
        
                    const zip = unzipSync( new Uint8Array( data ) );
                    const array = new Uint8Array( zip[ 'head256x256x109' ].buffer );
        
                    const texture = new THREE.DataArrayTexture( array, 256, 256, 109 );
                    texture.format = THREE.RedFormat;
                    texture.needsUpdate = true;
        
                    const material = new THREE.ShaderMaterial( {
                        uniforms: {
                            diffuse: { value: texture },
                            depth: { value: 55 },
                            size: { value: new THREE.Vector2( planeWidth, planeHeight ) }
                        },
                        vertexShader: /* glsl */`
                        uniform vec2 size;
                        out vec2 vUv;
        
                        void main() {
        
                            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        
                            // Convert position.xy to 1.0-0.0
        
                            vUv.xy = position.xy / size + 0.5;
                            vUv.y = 1.0 - vUv.y; // original data is upside down
        
                        }
                        `.trim(),
                        fragmentShader: /* glsl */`
                            precision highp float;
                            precision highp int;
                            precision highp sampler2DArray;
        
                            uniform sampler2DArray diffuse;
                            in vec2 vUv;
                            uniform int depth;
        
                            out vec4 outColor;
        
                            void main() {
        
                                vec4 color = texture( diffuse, vec3( vUv, depth ) );
        
                                // lighten a bit
                                outColor = vec4( color.rrr * 1.5, 1.0 );
        
                            }
                        `.trim(),
                        glslVersion: THREE.GLSL3
                    } );
        
                    const geometry = new THREE.PlaneGeometry( planeWidth, planeHeight );
        
                    mesh = new THREE.Mesh( geometry, material );
        
                    scene.add( mesh );
        
                } );
        
                app.signal.onAppUpdate.add(animate)
        }
        
        
        function animate() {
        
            if ( mesh ) {
        
                let value = mesh.material.uniforms[ 'depth' ].value;
        
                value += depthStep;
        
                if ( value > 109.0 || value < 0.0 ) {
        
                    if ( value > 1.0 ) value = 109.0 * 2.0 - value;
                    if ( value < 0.0 ) value = - value;
        
                    depthStep = - depthStep;
        
                }
        
                mesh.material.uniforms[ 'depth' ].value = value;
        
            }
        
        
        }
    }
    catch (e) {
        console.error(e);
    }
};