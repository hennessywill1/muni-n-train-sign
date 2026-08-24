export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
 
  try {
    const STOP_ID = '13911';
    const ROUTE = 'N';
    const AGENCY = 'sfmta';
    
    const url = `http://webservices.nextbus.com/service/publicXMLFeed?command=predictions&a=${AGENCY}&stopId=${STOP_ID}&routeTag=${ROUTE}`;
    
    const response = await fetch(url);
    const xml = await response.text();
    
    // Return the first 2000 characters of raw XML for debugging
    res.status(200).json({
      url: url,
      xmlLength: xml.length,
      rawXml: xml.substring(0, 2000)
    });
  } catch (error) {
    res.status(200).json({ 
      error: error.message
    });
  }
}
