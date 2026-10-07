import dns from 'dns';
import { promisify } from 'util';

const resolveSrv = promisify(dns.resolveSrv);
const resolveTxt = promisify(dns.resolveTxt);

// dns.setServers(['8.8.8.8', '1.1.1.1']);

try {
    console.log('Resolving SRV for _mongodb._tcp.cluster0.8bzgki5.mongodb.net...');
    const srv = await resolveSrv('_mongodb._tcp.cluster0.8bzgki5.mongodb.net');
    console.log('SRV Records:', srv);

    console.log('Resolving TXT for cluster0.8bzgki5.mongodb.net...');
    const txt = await resolveTxt('cluster0.8bzgki5.mongodb.net');
    console.log('TXT Records:', txt);
} catch (err) {
    console.error('DNS Resolution Error:', err);
}
