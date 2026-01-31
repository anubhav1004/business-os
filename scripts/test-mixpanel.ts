/**
 * Test Mixpanel API Connection
 * Run with: npx tsx scripts/test-mixpanel.ts
 */

const SERVICE_ACCOUNT = 'ugctracker.5cff36.mp-service-account';
const SECRET = 'x6rB6Kr8WrHmfdvKzpkwIisVrZFaja2k';
const PROJECT_ID = '2778692'; // From the Mixpanel URL

// Service account auth format
const auth = Buffer.from(`${SERVICE_ACCOUNT}:${SECRET}`).toString('base64');

async function testMixpanel() {
  console.log('🔄 Testing Mixpanel connection...\n');
  console.log(`🔑 Service Account: ${SERVICE_ACCOUNT}`);
  console.log(`📁 Project ID: ${PROJECT_ID}\n`);

  // Get today and 7 days ago
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];
  const fromDate = formatDate(sevenDaysAgo);
  const toDate = formatDate(today);

  console.log(`📅 Date range: ${fromDate} to ${toDate}\n`);

  // Test 1: Export API with correct project ID
  try {
    console.log('📊 Test 1: Export API...');

    const exportUrl = `https://data.mixpanel.com/api/2.0/export?project_id=${PROJECT_ID}&from_date=${fromDate}&to_date=${toDate}`;

    const response = await fetch(exportUrl, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const text = await response.text();
      const lines = text.trim().split('\n').filter(l => l);
      console.log(`✅ Export API works! Found ${lines.length} events\n`);

      // Parse and show unique event names
      const eventNames = new Set<string>();
      lines.forEach(line => {
        try {
          const event = JSON.parse(line);
          eventNames.add(event.event);
        } catch {}
      });

      console.log('📋 Event types found:');
      Array.from(eventNames).slice(0, 15).forEach(name => {
        console.log(`  - ${name}`);
      });

      // Show sample event
      if (lines.length > 0) {
        console.log('\n📝 Sample event:');
        try {
          const sample = JSON.parse(lines[0]);
          console.log(JSON.stringify(sample, null, 2).slice(0, 500));
        } catch {}
      }
    } else {
      const errorText = await response.text();
      console.log(`❌ Export API error (${response.status}): ${errorText}`);
    }
  } catch (error) {
    console.log('❌ Error:', error);
  }

  // Test 2: JQL API with project ID
  try {
    console.log('\n📊 Test 2: JQL API - Top events by count...');

    const jqlScript = `
      function main() {
        return Events({
          from_date: '${fromDate}',
          to_date: '${toDate}'
        })
        .groupBy(["name"], mixpanel.reducer.count())
        .sortDesc("value")
        .limit(15);
      }
    `;

    const jqlUrl = `https://mixpanel.com/api/2.0/jql?project_id=${PROJECT_ID}`;

    const response = await fetch(jqlUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: `script=${encodeURIComponent(jqlScript)}`,
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ JQL API works! Top events:');
      if (Array.isArray(data)) {
        data.forEach((item: any, i: number) => {
          const name = item.key?.[0] || item.name || 'Unknown';
          const count = item.value || 0;
          console.log(`  ${i + 1}. ${name}: ${count.toLocaleString()} events`);
        });
      }
    } else {
      const errorText = await response.text();
      console.log(`❌ JQL API error (${response.status}): ${errorText}`);
    }
  } catch (error) {
    console.log('❌ Error:', error);
  }

  // Test 3: Insights API
  try {
    console.log('\n📊 Test 3: Insights API...');

    const insightsUrl = `https://mixpanel.com/api/2.0/insights?project_id=${PROJECT_ID}`;

    const response = await fetch(insightsUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        bookmark_id: 10927441, // From the dashboard URL
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Insights API works!');
      console.log(JSON.stringify(data, null, 2).slice(0, 800));
    } else {
      const errorText = await response.text();
      console.log(`❌ Insights API error (${response.status}): ${errorText.slice(0, 200)}`);
    }
  } catch (error) {
    console.log('❌ Error:', error);
  }
}

testMixpanel();
