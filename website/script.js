// ZIM Frame to load canvas and stage for ZIM components 
// colorRange is being used to return a darker version of ZIM green 
const frame = new Frame("fit", 500, 800, green, colorRange(green, black, .2));
frame.on("ready", () => {// ES6 Arrow Function - similar to function(){}
  zog("ready from ZIM Frame"); // logs in console (F12 - choose console)

  // often need below - so consider it part of the template
  const stage = frame.stage;
  const stageW = frame.width;
  const stageH = frame.height;

  // REFERENCES for ZIM at https://zimjs.com
  // see https://zimjs.com/intro.html for an intro example
  // see https://zimjs.com/learn.html for video and code tutorials
  // see https://zimjs.com/docs.html for documentation

  // CODE HERE

  // this code is a mix of ZIM and ThreeJS 
  // ThreeJS is used for the model and the picture plane

  // use the ZIM three helper library to set up ThreeJS
  const display = new zim.Three({
    frame: frame,
    width: 500,
    height: 800,
    cameraPosition: new THREE.Vector3(0, 0, 250) });


  if (display.success) {// otherwise no WebGL

    const scene = display.scene;
    const camera = display.camera;

    // we are loading the JSON for the model in the phone.js file
    // in there is a global variable called phoneData
    // this allows us to manipulate materials with JavaScript
    // colors are in decimal number so convert from hex (remove # first)
    // in this case we could have gone into the data and hard coded the color 
    // but here: https://zimjs.com/three - we let the user change the color
    phoneData.materials[0].color = parseInt(white.slice(1), 16);
    phoneData.materials[2].color = parseInt(white.slice(1), 16);
    phoneData.materials[11].color = parseInt(white.slice(1), 16);

    // create a ZIM rectangle behind phone that can be used to capture swiping 	
    const swiperRect = new Rectangle(500, 500, frame.color).centerReg(stage);

    // load in the phone model
    // would use loader.load() if loading from a JSON file
    // but we already have the JSON file in our phoneData global variable from phone.js
    loader = new THREE.ObjectLoader();
    loader.parse(phoneData, function (phone) {

      phone.position.set(0, -115, 0);

      // bring in the pictures as materials with textures
      const path = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/2104200/";
      const pics = [];
      loop(9, i => {
        let picTexture = new THREE.ImageUtils.loadTexture(`${path}pic${i}.jpg`);
        pics.push(new THREE.MeshBasicMaterial({ map: picTexture }));
      });

      // add to picture plane to model so they spin together
      // had to eyball the fit and positioning
      const picGeometry = new THREE.PlaneGeometry(99, 172, 4, 4);
      const pic = new THREE.Mesh(picGeometry, pics[0]);
      pic.position.z = 7.95;
      pic.position.y = 118.8;
      phone.add(pic);
      timeout(200, () => {
        scene.add(phone); // otherwise material flashes pic loads
      });

      // ZIM Swiper for controlling the rotation of the model in two directions
      // set swipe controls for rotating phone
      // swipeOn, target, property, sensitivity, horizontal, min, max, damp
      // let the phone rotate 40 Degrees past its two ends
      const swiperX = new Swiper(swiperRect, phone.rotation, "x", .001, false, -.2, 0);
      const swiperY = new Swiper(swiperRect, phone.rotation, "y", .01, true, -360 * RAD * 8 - 40 * RAD, 40 * RAD);

      // ZIM Indicator at bottom			
      const indicator = new Indicator({
        width: 300,
        height: 30,
        num: 9,
        interactive: true }).

      pos(0, 44, CENTER, BOTTOM).
      alp(0).
      animate({ alpha: 1 }).
      change(() => {
        // disable swiper when clicking indicator
        swiperY.enabled = false;
        // end rotation is selectedIndex times 360 in Radians
        let rotation = -indicator.selectedIndex * 360 * RAD;
        // diff is used to figure out the time to rotate
        let diff = Math.abs(rotation - phone.rotation.y);
        // prevent the indicator from flashing to selectedIndex
        indicator.selectedIndex = lastIndex;
        // to animate ThreeJS object use animate function not method
        // then we specify the ThreeJS object as the target
        // use a strin for rotatiting a dot property
        animate({
          target: phone,
          props: { "rotation.y": rotation },
          time: diff * DEG * 2.5,
          ease: "sineInOut",
          call: () => {
            // turn the swiper back on when animation is done 
            // and set its value right away
            swiperY.immediate(phone.rotation.y);
            swiperY.enabled = true;
          } });

      });
      let lastIndex = indicator.selectedIndex = 0;

      // ZIM Ticker
      // constantly check if swiping has moved the indicator
      // change the indicator on the backside of the phone 
      // and at this time, swap the material (picture)
      Ticker.add(() => {
        let newIndicator = Math.abs(Math.floor((phone.rotation.y * DEG + 180) / 360));
        if (indicator.selectedIndex != newIndicator) {
          lastIndex = indicator.selectedIndex = newIndicator;
          pic.material = pics[indicator.selectedIndex];
        }
      });

    }); // end of phone model loading

    const light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0, 250, 100);
    scene.add(light);

    const light2 = new THREE.PointLight(0xffffff);
    light2.position.set(100, 250, 100);
    scene.add(light2);

  } else {// no WebGL
    // ZIM Pane to display message
    const pane = new Pane(stageW + 100, 200, "SORRY - NEEDS WEBGL", light);
    pane.show();
  }

  // ZIM STYLE and LabelLetters for top title
  STYLE = {
    color: white,
    size: [18, 20, 22],
    delayPick: true };

  new LabelLetters({ label: "Try out the filter game now!", valign: TOP }).
  pos(0, 25, CENTER).
  alp(0).
  animate({
    props: { alpha: 1 },
    time: 700,
    wait: 300 });

  STYLE = {};


  stage.update(); // this is needed to show any changes

  // DOCS FOR ITEMS USED
  // https://zimjs.com/docs.html?item=Frame
  // https://zimjs.com/docs.html?item=Rectangle
  // https://zimjs.com/docs.html?item=LabelLetters
  // https://zimjs.com/docs.html?item=Pane
  // https://zimjs.com/docs.html?item=Indicator
  // https://zimjs.com/docs.html?item=change
  // https://zimjs.com/docs.html?item=animate
  // https://zimjs.com/docs.html?item=loop
  // https://zimjs.com/docs.html?item=pos
  // https://zimjs.com/docs.html?item=alp
  // https://zimjs.com/docs.html?item=centerReg
  // https://zimjs.com/docs.html?item=Swiper
  // https://zimjs.com/docs.html?item=timeout
  // https://zimjs.com/docs.html?item=colorRange
  // https://zimjs.com/docs.html?item=zog
  // https://zimjs.com/docs.html?item=STYLE
  // https://zimjs.com/docs.html?item=Ticker

  // FOOTER
  // call remote script to make ZIM icon - you will not need this
  createIcon();

}); // end of ready