
    window.onload = async () => {
    const env = {
        serviceUrl: "https://vjmap.com/server/api/v1",
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M",
        exampleMapId: "sys_zp",
        assetsPath: "../../assets/",
        ...__env__ // 如果您已私有化部署，需要连接已部署的服务器地址和token，请打开js/env.js,修改里面的参数
    };
    try {
        // 在线效果查看地址: https://vjmap.com/map3d/demo/#/demo/map/particle/03particlebatch
        // --批量创建粒子效果--
        let svc = new vjmap3d.Service(env.serviceUrl, env.accessToken);
        let app = new vjmap3d.App(svc, {
            container: "map", // 容器id
            stat: { show: true, left: "0" },
            scene: {
                gridHelper: { visible: true } // 是否显示坐标网格
            },
            camera: {  // 相机设置
                viewHelper: { enable: true, position: "leftBottom" } // 是否显示视角指示器
            }
        })
        let particleRes = await vjmap3d.ResManager.loadRes(
            env.assetsPath + "json/magic_zone.json",
            true,
            "particle"
        );
        for(let i = 0; i < 20; i++) {
            for(let j = 0; j < 20; j++) {
                let color = vjmap3d.randColor();
                app.loadParticleFromRes(particleRes.clone(), {
                    onAddSystem: (obj, system) => {
                        // 增加前对每一个粒子效果修改属性
                        system.startColor.color.x = color.r;
                        system.startColor.color.y = color.g;
                        system.startColor.color.z = color.b;
                    },
                    position: [i * 5 - 50, 0, j * 5- 50],
                    scale: Math.random() * 2
                });
            }
        }
    }
    catch (e) {
        console.error(e);
    }
};