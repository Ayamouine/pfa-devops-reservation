const { execSync } = require('child_process');
function sh(c){ try{ return execSync(c,{encoding:'utf8',maxBuffer:50*1024*1024}).toString(); }catch(e){ return 'SH_ERR:'+(e.stderr||e.message||'').toString().slice(-2000); } }
const base = 'C:/Users/info/Documents/pfa_complet/pfa_complet_final';
const otp = sh('git show HEAD:services/auth-service/src/main/java/com/example/authservice/service/OtpService.java');
console.log('HEAD_OtpService lignes='+otp.split('\n').length+' purpose2='+(otp.includes('purpose2')?'OUI':'non'));
const otpL = otp.split('\n');
const l35 = otpL[34]||'';
console.log('  HEAD_Otp L35: '+l35);
const sb = sh('git show HEAD:frontend/src/components/Sidebar.js');
const sbL = sb.split('\n');
console.log('HEAD_Sidebar lignes='+sbL.length);
const l26 = sbL[25]||'';
console.log('  HEAD_SIDE L26 len='+l26.length+' semi='+l26.trimEnd().endsWith(';')+' |'+l26);
