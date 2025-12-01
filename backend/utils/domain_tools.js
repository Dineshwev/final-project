const dns = require('dns').promises;
const axios = require('axios');
const { URL } = require('url');
const whois = require('whois-promise');

/**
 * Check domain DNS records
 */
async function checkDNS(domain) {
  try {
    const [a, aaaa, mx, txt, ns] = await Promise.all([
      dns.resolve4(domain).catch(() => []),
      dns.resolve6(domain).catch(() => []),
      dns.resolveMx(domain).catch(() => []),
      dns.resolveTxt(domain).catch(() => []),
      dns.resolveNs(domain).catch(() => [])
    ]);

    return {
      a,
      aaaa,
      mx,
      txt,
      ns
    };
  } catch (error) {
    throw new Error(`DNS lookup failed: ${error.message}`);
  }
}

/**
 * Check domain redirects
 */
async function checkRedirects(url) {
  try {
    const redirects = [];
    let currentUrl = url;

    while (true) {
      const response = await axios.head(currentUrl, {
        maxRedirects: 0,
        validateStatus: status => status >= 200 && status < 400
      });

      const location = response.headers.location;
      if (!location) break;

      redirects.push({
        from: currentUrl,
        to: location,
        statusCode: response.status
      });

      currentUrl = new URL(location, currentUrl).href;
      if (redirects.length >= 10) break; // Prevent infinite redirects
    }

    return redirects;
  } catch (error) {
    throw new Error(`Redirect check failed: ${error.message}`);
  }
}

/**
 * Get domain WHOIS information
 */
async function getWhoisInfo(domain) {
  try {
    const whoisData = await whois(domain);
    return {
      registrar: whoisData.registrar,
      creationDate: whoisData.creationDate,
      expirationDate: whoisData.expirationDate,
      nameServers: whoisData.nameServers,
      status: whoisData.status
    };
  } catch (error) {
    throw new Error(`WHOIS lookup failed: ${error.message}`);
  }
}

/**
 * Check domain availability
 */
async function checkDomainAvailability(domain) {
  try {
    await dns.resolve(domain);
    return false; // Domain is taken
  } catch (error) {
    if (error.code === 'ENOTFOUND') {
      return true; // Domain might be available
    }
    throw error;
  }
}

/**
 * Get domain IP location
 */
async function getIPLocation(domain) {
  try {
    const ips = await dns.resolve4(domain);
    const ip = ips[0];
    
    const response = await axios.get(`http://ip-api.com/json/${ip}`);
    return response.data;
  } catch (error) {
    throw new Error(`IP location lookup failed: ${error.message}`);
  }
}

/**
 * Check robots.txt
 */
async function checkRobotsTxt(domain) {
  try {
    const response = await axios.get(`https://${domain}/robots.txt`);
    return {
      exists: true,
      content: response.data,
      statusCode: response.status
    };
  } catch (error) {
    if (error.response?.status === 404) {
      return {
        exists: false,
        content: null,
        statusCode: 404
      };
    }
    throw new Error(`Robots.txt check failed: ${error.message}`);
  }
}

module.exports = {
  checkDNS,
  checkRedirects,
  getWhoisInfo,
  checkDomainAvailability,
  getIPLocation,
  checkRobotsTxt
};