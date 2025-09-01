# Complete Guide: Setting up scatterbrainai.com with Cloudflare and Vercel

This guide provides step-by-step instructions for configuring your scatterbrainai.com domain (managed by Cloudflare) to work with your Vercel deployment.

## Prerequisites
- Domain registered and added to Cloudflare
- Vercel account with your project deployed
- Access to both Cloudflare and Vercel dashboards

## Table of Contents
1. [Vercel Configuration](#1-vercel-configuration)
2. [Cloudflare DNS Settings](#2-cloudflare-dns-settings)
3. [SSL/HTTPS Configuration](#3-sslhttps-configuration)
4. [DNS Records Setup](#4-dns-records-setup)
5. [Cloudflare Proxy Settings](#5-cloudflare-proxy-settings)
6. [Verification Steps](#6-verification-steps)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Vercel Configuration

### Step 1.1: Access Your Vercel Project
1. Log in to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `scatterbrainai-platform` project
3. Navigate to **Settings** → **Domains**

### Step 1.2: Add Your Domain
1. Click **Add Domain**
2. Enter `scatterbrainai.com`
3. Click **Add**
4. Vercel will show you DNS configuration instructions - keep this page open

### Step 1.3: Add WWW Subdomain
1. Still in the Domains section, click **Add Domain** again
2. Enter `www.scatterbrainai.com`
3. Click **Add**
4. Select "Redirect to scatterbrainai.com" when prompted (recommended)

### Step 1.4: Note Vercel's DNS Values
Vercel will provide you with specific DNS records. They typically include:
- An A record pointing to `76.76.21.21`
- A CNAME record for www pointing to `cname.vercel-dns.com`

**Important**: Keep this page open as you'll need these values for Cloudflare configuration.

---

## 2. Cloudflare DNS Settings

### Step 2.1: Access Cloudflare DNS Management
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your `scatterbrainai.com` domain
3. Navigate to **DNS** → **Records**

### Step 2.2: Remove Conflicting Records
Before adding new records, remove any existing A or CNAME records for:
- `@` (root domain)
- `www`

Click the **Edit** button next to each record and then **Delete**.

---

## 3. SSL/HTTPS Configuration

### Step 3.1: Cloudflare SSL/TLS Settings
1. In Cloudflare, go to **SSL/TLS** → **Overview**
2. Set encryption mode to **Full (strict)**
   - This ensures end-to-end encryption between visitors, Cloudflare, and Vercel

### Step 3.2: Enable Additional Security Features
1. Navigate to **SSL/TLS** → **Edge Certificates**
2. Enable these options:
   - **Always Use HTTPS**: ON
   - **Automatic HTTPS Rewrites**: ON
   - **Minimum TLS Version**: 1.2

### Step 3.3: HSTS Configuration (Optional but Recommended)
1. Still in **Edge Certificates**
2. Click **Enable HSTS**
3. Configure:
   - Max Age: 6 months (15552000 seconds)
   - Include subdomains: Yes
   - Preload: Yes (after testing)

---

## 4. DNS Records Setup

### Step 4.1: Add Root Domain A Record
1. In Cloudflare DNS, click **Add record**
2. Configure:
   - **Type**: A
   - **Name**: @ (or leave empty for root)
   - **IPv4 address**: 76.76.21.21
   - **Proxy status**: DNS only (gray cloud) initially
   - **TTL**: Auto
3. Click **Save**

### Step 4.2: Add WWW CNAME Record
1. Click **Add record**
2. Configure:
   - **Type**: CNAME
   - **Name**: www
   - **Target**: cname.vercel-dns.com
   - **Proxy status**: DNS only (gray cloud) initially
   - **TTL**: Auto
3. Click **Save**

### Step 4.3: Add Additional Subdomains (Optional)
For staging or development environments:
1. **staging.scatterbrainai.com**:
   - Type: CNAME
   - Name: staging
   - Target: cname.vercel-dns.com
   - Proxy status: DNS only

2. **api.scatterbrainai.com** (if using separate API):
   - Type: CNAME
   - Name: api
   - Target: cname.vercel-dns.com
   - Proxy status: DNS only

---

## 5. Cloudflare Proxy Settings

### Step 5.1: Initial Configuration (DNS Only)
**Important**: Start with DNS only mode (gray cloud) for initial setup:
1. Ensure all your DNS records show a gray cloud icon
2. This bypasses Cloudflare's proxy initially for easier debugging

### Step 5.2: Wait for DNS Propagation
1. Wait 5-10 minutes for DNS changes to propagate
2. You can check propagation status at [whatsmydns.net](https://www.whatsmydns.net)

### Step 5.3: Enable Cloudflare Proxy
After verifying your site works with DNS only:
1. Return to Cloudflare DNS settings
2. Click the gray cloud icon next to each record to enable proxy (orange cloud)
3. Enable for:
   - Root domain (@)
   - www subdomain

### Step 5.4: Configure Page Rules (Optional)
1. Navigate to **Rules** → **Page Rules**
2. Create useful rules:

**Rule 1: Force HTTPS**
- URL: `http://*scatterbrainai.com/*`
- Setting: Always Use HTTPS

**Rule 2: WWW Redirect**
- URL: `www.scatterbrainai.com/*`
- Setting: Forwarding URL (301)
- Destination: `https://scatterbrainai.com/$1`

### Step 5.5: Performance Settings
1. Go to **Speed** → **Optimization**
2. Enable:
   - Auto Minify (JavaScript, CSS, HTML)
   - Brotli compression
   - Early Hints (if available)

---

## 6. Verification Steps

### Step 6.1: DNS Verification
1. Open terminal/command prompt
2. Run these commands:
```bash
# Check A record
nslookup scatterbrainai.com

# Check CNAME record
nslookup www.scatterbrainai.com

# Check DNS propagation
dig scatterbrainai.com
```

Expected results:
- A record should resolve to 76.76.21.21
- CNAME should resolve to cname.vercel-dns.com

### Step 6.2: HTTPS Verification
1. Visit https://scatterbrainai.com in your browser
2. Check for:
   - Padlock icon indicating secure connection
   - No certificate warnings
   - Proper redirect from http to https

### Step 6.3: Vercel Dashboard Verification
1. Return to Vercel dashboard
2. Go to **Settings** → **Domains**
3. You should see green checkmarks next to:
   - scatterbrainai.com
   - www.scatterbrainai.com

### Step 6.4: SSL Certificate Verification
1. In browser, click the padlock icon
2. View certificate details
3. Verify:
   - Issued by: Let's Encrypt or Cloudflare
   - Valid for: scatterbrainai.com and *.scatterbrainai.com

### Step 6.5: Performance Testing
1. Test your site at [GTmetrix](https://gtmetrix.com)
2. Check load times and optimization scores
3. Verify Cloudflare CDN is working (check response headers)

### Step 6.6: Functionality Testing
Test critical paths:
- [ ] Landing page loads correctly
- [ ] All assets (CSS, JS, images) load properly
- [ ] API routes work (test authentication, data fetching)
- [ ] WebSocket connections work (if applicable)
- [ ] File uploads work (if applicable)

---

## 7. Troubleshooting

### Common Issues and Solutions

#### Issue 1: "Invalid Configuration" in Vercel
**Symptoms**: Red error next to domain in Vercel
**Solutions**:
1. Ensure DNS records exactly match Vercel's requirements
2. Disable Cloudflare proxy temporarily (gray cloud)
3. Wait for DNS propagation (up to 48 hours in rare cases)

#### Issue 2: SSL Certificate Errors
**Symptoms**: Browser shows "Not Secure" or certificate warnings
**Solutions**:
1. In Cloudflare, ensure SSL/TLS is set to "Full (strict)"
2. Clear browser cache and cookies
3. Wait 15-30 minutes for certificates to provision

#### Issue 3: Infinite Redirect Loop
**Symptoms**: Browser shows "Too many redirects" error
**Solutions**:
1. In Cloudflare SSL/TLS settings, ensure it's set to "Full (strict)"
2. Disable "Always Use HTTPS" temporarily
3. Check Vercel doesn't have conflicting redirects

#### Issue 4: 521 Error (Web Server Is Down)
**Symptoms**: Cloudflare 521 error page
**Solutions**:
1. Verify Vercel deployment is live
2. Temporarily disable Cloudflare proxy (gray cloud)
3. Check if Vercel is blocking Cloudflare IPs

#### Issue 5: Slow Performance
**Symptoms**: Site loads slowly despite Cloudflare
**Solutions**:
1. Ensure Cloudflare proxy is enabled (orange cloud)
2. Check Cloudflare cache settings
3. Enable Cloudflare APO (Automatic Platform Optimization) for better performance

### Advanced Debugging

#### Check DNS Resolution
```bash
# Detailed DNS query
dig +trace scatterbrainai.com

# Check specific nameserver
dig @1.1.1.1 scatterbrainai.com

# Check all record types
dig scatterbrainai.com ANY
```

#### Check HTTP Headers
```bash
# Check response headers
curl -I https://scatterbrainai.com

# Check Cloudflare headers
curl -I https://scatterbrainai.com | grep -i cf-
```

#### Verify Cloudflare Integration
Look for these headers in response:
- `cf-ray`: Cloudflare request ID
- `cf-cache-status`: Cache status (HIT/MISS/BYPASS)
- `server: cloudflare`

---

## Best Practices

### Security Recommendations
1. **Enable Cloudflare WAF** (Web Application Firewall)
   - Go to Security → WAF
   - Enable managed rules

2. **Configure Rate Limiting**
   - Protect API endpoints
   - Prevent abuse

3. **Set Up Firewall Rules**
   - Block malicious IPs
   - Geo-restrictions if needed

### Performance Optimization
1. **Cache Configuration**
   - Set appropriate cache headers in your Next.js app
   - Configure Cloudflare page rules for static assets

2. **Image Optimization**
   - Use Cloudflare Polish for automatic image optimization
   - Enable WebP conversion

3. **Enable HTTP/3**
   - In Cloudflare Network settings
   - Provides faster connection establishment

### Monitoring Setup
1. **Cloudflare Analytics**
   - Monitor traffic patterns
   - Track performance metrics

2. **Set Up Alerts**
   - DNS changes
   - SSL certificate expiration
   - Traffic anomalies

---

## Next Steps

After successful setup:

1. **Configure Email Records** (if needed)
   - Add MX records for email service
   - Set up SPF, DKIM, DMARC records

2. **Set Up Staging Environment**
   - Create staging.scatterbrainai.com
   - Use for testing before production

3. **Implement Monitoring**
   - Set up uptime monitoring
   - Configure error tracking
   - Monitor Core Web Vitals

4. **Regular Maintenance**
   - Review Cloudflare security events
   - Update DNS records as needed
   - Monitor SSL certificate renewals

---

## Additional Resources

- [Vercel Custom Domains Documentation](https://vercel.com/docs/custom-domains)
- [Cloudflare DNS Documentation](https://developers.cloudflare.com/dns/)
- [Cloudflare for SaaS](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/)
- [Next.js Deployment Best Practices](https://nextjs.org/docs/deployment)

---

## Support Contacts

- **Vercel Support**: support@vercel.com
- **Cloudflare Support**: Via dashboard support ticket
- **Community Forums**: 
  - [Vercel Discussions](https://github.com/vercel/next.js/discussions)
  - [Cloudflare Community](https://community.cloudflare.com)

---

*Last updated: December 2024*
*Guide Version: 1.0*