sed -E 's/(export.*|import.*)//' node_modules/vanilla-picker/dist/vanilla-picker.mjs > ../vcr/WebContent/wrtc/SVGLib/main.js
sed -E 's/(export.*|import.*)//' dist/svg/fesm2015/svg.mjs >> ../vcr/WebContent/wrtc/SVGLib/main.js

sed -E 's/(export.*|import.*)//' node_modules/vanilla-picker/dist/vanilla-picker.mjs > ../vcr/target/vcr3-build/wrtc/SVGLib/main.js
sed -E 's/(export.*|import.*)//' dist/svg/fesm2015/svg.mjs >> ../vcr/target/vcr3-build/wrtc/SVGLib/main.js

