
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/threejs/177threeWebglbuffergeometryuint
        // --buffergeometry_uint--
        // 下面代码参考threejs官方示例改写 https://threejs.org/examples/#webgl_buffergeometry_uint
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                defaultLights: false
            },
            stat: { show: true, left: "0" },
            camera: {
                fov: 27,
                near: 1,
                far: 3500,
                position: [0, 0, 2750]
            }
        })
        let scene = app.scene, camera = app.camera, renderer = app.renderer;
        
        let mesh;
        
        init();
        
        function init() {
        
            scene.background = new THREE.Color( 0x050505 );
            scene.fog = new THREE.Fog( 0x050505, 2000, 3500 );
        
            scene.add( new THREE.AmbientLight( 0xcccccc ) );
        
            const light1 = new THREE.DirectionalLight( 0xffffff, 1.5 );
            light1.position.set( 1, 1, 1 );
            scene.add( light1 );
        
            const light2 = new THREE.DirectionalLight( 0xffffff, 4.5 );
            light2.position.set( 0, - 1, 0 );
            scene.add( light2 );
        
            //
        
            const triangles = 500000;
        
            const geometry = new THREE.BufferGeometry();
        
            const positions = [];
            const normals = [];
            const colors = [];
        
            const color = new THREE.Color();
        
            const n = 800, n2 = n / 2;	// triangles spread in the cube
            const d = 12, d2 = d / 2;	// individual triangle size
        
            const pA = new THREE.Vector3();
            const pB = new THREE.Vector3();
            const pC = new THREE.Vector3();
        
            const cb = new THREE.Vector3();
            const ab = new THREE.Vector3();
        
            for ( let i = 0; i < triangles; i ++ ) {
        
                // positions
        
                const x = Math.random() * n - n2;
                const y = Math.random() * n - n2;
                const z = Math.random() * n - n2;
        
                const ax = x + Math.random() * d - d2;
                const ay = y + Math.random() * d - d2;
                const az = z + Math.random() * d - d2;
        
                const bx = x + Math.random() * d - d2;
                const by = y + Math.random() * d - d2;
                const bz = z + Math.random() * d - d2;
        
                const cx = x + Math.random() * d - d2;
                const cy = y + Math.random() * d - d2;
                const cz = z + Math.random() * d - d2;
        
                positions.push( ax, ay, az );
                positions.push( bx, by, bz );
                positions.push( cx, cy, cz );
        
                // flat face normals
        
                pA.set( ax, ay, az );
                pB.set( bx, by, bz );
                pC.set( cx, cy, cz );
        
                cb.subVectors( pC, pB );
                ab.subVectors( pA, pB );
                cb.cross( ab );
        
                cb.normalize();
        
                const nx = cb.x;
                const ny = cb.y;
                const nz = cb.z;
        
                normals.push( nx * 32767, ny * 32767, nz * 32767 );
                normals.push( nx * 32767, ny * 32767, nz * 32767 );
                normals.push( nx * 32767, ny * 32767, nz * 32767 );
        
                // colors
        
                const vx = ( x / n ) + 0.5;
                const vy = ( y / n ) + 0.5;
                const vz = ( z / n ) + 0.5;
        
                color.setRGB( vx, vy, vz );
        
                colors.push( color.r * 255, color.g * 255, color.b * 255 );
                colors.push( color.r * 255, color.g * 255, color.b * 255 );
                colors.push( color.r * 255, color.g * 255, color.b * 255 );
        
            }
        
            const positionAttribute = new THREE.Float32BufferAttribute( positions, 3 );
            const normalAttribute = new THREE.Int16BufferAttribute( normals, 3 );
            const colorAttribute = new THREE.Uint8BufferAttribute( colors, 3 );
        
            normalAttribute.normalized = true; // this will map the buffer values to 0.0f - +1.0f in the shader
            colorAttribute.normalized = true;
        
            geometry.setAttribute( 'position', positionAttribute );
            geometry.setAttribute( 'normal', normalAttribute );
            geometry.setAttribute( 'color', colorAttribute );
        
            geometry.computeBoundingSphere();
        
            const material = new THREE.MeshPhongMaterial( {
                color: 0xd5d5d5, specular: 0xffffff, shininess: 250,
                side: THREE.DoubleSide, vertexColors: true
            } );
        
            mesh = new THREE.Mesh( geometry, material );
            scene.add( mesh );
        
            vjmap3d.Entity.attchObject(mesh).addAction(() => {
                const time = Date.now() * 0.001;
        
                mesh.rotation.x = time * 0.25;
                mesh.rotation.y = time * 0.5;
            })
        
        }
        
    }
    catch (e) {
        console.error(e);
    }
};