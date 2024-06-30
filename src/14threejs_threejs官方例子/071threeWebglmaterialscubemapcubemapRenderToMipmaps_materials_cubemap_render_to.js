
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/071threeWebglmaterialscubemapcubemapRenderToMipmaps
        // --materials_cubemap_render_to_mipmaps--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_materials_cubemap_render_to_mipmaps
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 50,
                near: 1,
                far: 10000,
                position: [0, 0, 500]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        
        const CubemapFilterShader = {
        
            name: 'CubemapFilterShader',
        
            uniforms: {
                cubeTexture: { value: null },
                mipIndex: { value: 0 },
            },
        
            vertexShader: /* glsl */ `
        
                varying vec3 vWorldDirection;
        
                #include <common>
        
                void main() {
                    vWorldDirection = transformDirection(position, modelMatrix);
                    #include <begin_vertex>
                    #include <project_vertex>
                    gl_Position.z = gl_Position.w; // set z to camera.far
                }
        
                `,
        
            fragmentShader: /* glsl */ `
        
                uniform samplerCube cubeTexture;
                varying vec3 vWorldDirection;
        
                uniform float mipIndex;
        
                #include <common>
        
                void main() {
                    vec3 cubeCoordinates = normalize(vWorldDirection);
        
                    // Colorize mip levels
                    vec4 color = vec4(1.0, 0.0, 0.0, 1.0);
                    if (mipIndex == 0.0) color.rgb = vec3(1.0, 1.0, 1.0);
                    else if (mipIndex == 1.0) color.rgb = vec3(0.0, 0.0, 1.0);
                    else if (mipIndex == 2.0) color.rgb = vec3(0.0, 1.0, 1.0);
                    else if (mipIndex == 3.0) color.rgb = vec3(0.0, 1.0, 0.0);
                    else if (mipIndex == 4.0) color.rgb = vec3(1.0, 1.0, 0.0);
        
                    gl_FragColor = textureCube(cubeTexture, cubeCoordinates, 0.0) * color;
                }
        
                `,
        };
        
        
        init();
        
        async function loadCubeTexture( urls ) {
        
            return new Promise( function ( resolve ) {
        
                new THREE.CubeTextureLoader().load( urls, function ( cubeTexture ) {
        
                    resolve( cubeTexture );
        
                } );
        
        
            } );
        
        }
        
        function allocateCubemapRenderTarget( cubeMapSize ) {
        
            const params = {
                magFilter: THREE.LinearFilter,
                minFilter: THREE.LinearMipMapLinearFilter,
                generateMipmaps: false,
                type: THREE.HalfFloatType,
                format: THREE.RGBAFormat,
                colorSpace: THREE.LinearSRGBColorSpace,
                depthBuffer: false,
            };
        
            const rt = new THREE.WebGLCubeRenderTarget( cubeMapSize, params );
        
            const mipLevels = Math.log( cubeMapSize ) * Math.LOG2E + 1.0;
            for ( let i = 0; i < mipLevels; i ++ ) rt.texture.mipmaps.push( {} );
        
            rt.texture.mapping = THREE.CubeReflectionMapping;
            return rt;
        
        }
        
        function renderToCubeTexture( cubeMapRenderTarget, sourceCubeTexture ) {
        
            const geometry = new THREE.BoxGeometry( 5, 5, 5 );
        
            const material = new THREE.ShaderMaterial( {
                name: CubemapFilterShader.name,
                uniforms: THREE.UniformsUtils.clone( CubemapFilterShader.uniforms ),
                vertexShader: CubemapFilterShader.vertexShader,
                fragmentShader: CubemapFilterShader.fragmentShader,
                side: THREE.BackSide,
                blending: THREE.NoBlending,
            } );
        
            material.uniforms.cubeTexture.value = sourceCubeTexture;
        
            const mesh = new THREE.Mesh( geometry, material );
            const cubeCamera = new THREE.CubeCamera( 1, 10, cubeMapRenderTarget );
            const mipmapCount = Math.floor( Math.log2( Math.max( cubeMapRenderTarget.width, cubeMapRenderTarget.height ) ) );
        
            for ( let mipmap = 0; mipmap < mipmapCount; mipmap ++ ) {
        
                material.uniforms.mipIndex.value = mipmap;
                material.needsUpdate = true;
        
                cubeMapRenderTarget.viewport.set( 0, 0, cubeMapRenderTarget.width >> mipmap, cubeMapRenderTarget.height >> mipmap );
        
                cubeCamera.activeMipmapLevel = mipmap;
                cubeCamera.update( renderer, mesh );
        
            }
        
            mesh.geometry.dispose();
            mesh.material.dispose();
        
        }
        
        function init() {
        
        
            camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 10000 );
            camera.position.z = 500;
        
            let assetsPath = "https://vjmap.com/map3d/resources/three/"
            // Load a cube texture
            const r = assetsPath + 'textures/cube/Park3Med/';
            const urls = [
                r + 'px.jpg', r + 'nx.jpg',
                r + 'py.jpg', r + 'ny.jpg',
                r + 'pz.jpg', r + 'nz.jpg'
            ];
        
            loadCubeTexture( urls ).then( ( cubeTexture ) => {
        
                // Allocate a cube map render target
                const cubeMapRenderTarget = allocateCubemapRenderTarget( 512 );
        
                // Render to all the mip levels of cubeMapRenderTarget
                renderToCubeTexture( cubeMapRenderTarget, cubeTexture );
        
                // Create geometry
                const sphere = new THREE.SphereGeometry( 100, 128, 128 );
                let material = new THREE.MeshBasicMaterial( { color: 0xffffff, envMap: cubeTexture } );
        
                let mesh = new THREE.Mesh( sphere, material );
                mesh.position.set( - 100, 0, 0 );
                scene.add( mesh );
        
                material = material.clone();
                material.envMap = cubeMapRenderTarget.texture;
        
                mesh = new THREE.Mesh( sphere, material );
                mesh.position.set( 100, 0, 0 );
                scene.add( mesh );
        
            } );
        
        }
        
        
    }
    catch (e) {
        console.error(e);
    }
};