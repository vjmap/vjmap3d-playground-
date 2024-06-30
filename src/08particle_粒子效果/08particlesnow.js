
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/particle/08particlesnow
        // --下雪粒子效果--
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            scene: {
                gridHelper: { visible: true } // 是否显示坐标网格
            },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            }
        })
        let texture = await vjmap3d.ResManager.loadTextureSync(env.assetsPath + "textures/texture1.png");
        app.addParticle({
            system: {
                duration: 3,
                looping: true,
                prewarm: true,
                startLife: new vjmap3d.IntervalValue(4.0, 5.0),
                startSpeed: new vjmap3d.IntervalValue(1, 2),
                startRotation: new vjmap3d.RandomQuatGenerator(),
                startSize: new  vjmap3d.IntervalValue(1, 2),
                startColor: new vjmap3d.ConstantColor(new THREE.Vector4(1, 1, 1, 1)),
                worldSpace: false,
        
                emissionOverTime: new vjmap3d.ConstantValue(100),
                emissionBursts: [
                    /*{
                        time: 0,
                        count: new ConstantValue(100),
                        cycle: 1,
                        interval: 0.01,
                        probability: 1,
                    },*/
                ],
        
                shape: new vjmap3d.CubeEmitter({
                    width: 100,
                    height: 5,
                    thickness: 100
                }),
                material: new THREE.MeshBasicMaterial({
                    map: texture,
                    blending: THREE.AdditiveBlending,
                    transparent: true,
                    side: THREE.DoubleSide,
                }),
                startTileIndex: new vjmap3d.ConstantValue(2),
                uTileCount: 10,
                vTileCount: 10,
                renderOrder: 1,
                renderMode: vjmap3d.RenderMode.BillBoard
            },
            simulations: [
                new vjmap3d.SetEmitDirection({
                    velocityX: new vjmap3d.IntervalValue(-5, 5),
                    velocityY: new vjmap3d.IntervalValue(0, -30)
                }),
                new vjmap3d.Rotation3DOverLife(
                    new vjmap3d.AxisAngleGenerator(
                        new THREE.Vector3(0, 0.5, 0.2).normalize(),
                        new vjmap3d.ConstantValue(1)
                    )
                ),
                new vjmap3d.ColorOverLife(
                    new vjmap3d.Gradient(
                        [
                            [new THREE.Vector3(1, 1, 1), 0],
                            [new THREE.Vector3(1, 1, 1), 0]
                        ],
                        [
                            [1, 0],
                            [1, 0.8],
                            [0, 1]
                        ]
                    ),
                ),
                // new vjmap3d.ApplyForce(
                //     new THREE.Vector3(0, -1, 0),
                //     new vjmap3d.ConstantValue(10)
                // ),
            ],
            position: [0, 0, 0]
        
        })
    }
    catch (e) {
        console.error(e);
    }
};