// ─────────────────────────────────────────────────────────────────────────────
// CVCoach UK — Local Matching Engine
// Zero AI. Runs entirely in the browser. CV text never leaves the device.
// ─────────────────────────────────────────────────────────────────────────────

// ── PII: split into two categories ───────────────────────────────────────────
//
// BIAS_PII   — information UK employers must NOT see (EHRC guidance).
//              Flag these for removal.
//
// CONTACT    — information recruiters REQUIRE.
//              Flag these as MISSING if absent, never as something to remove.
//
const BIAS_PII_PATTERNS: { type: string; pattern: RegExp }[] = [
  { type: "National Insurance number", pattern: /\b[A-CEGHJ-PR-TW-Z]{1}[A-CEGHJ-NPR-TW-Z]{1}[0-9]{6}[A-D\s]{1}\b/i },
  { type: "Date of birth",             pattern: /\b(dob|date of birth|born)[:\s]+\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}\b/i },
  { type: "Date of birth",             pattern: /\b\d{1,2}(st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}\b/i },
  { type: "Home address",              pattern: /\b\d+\s+[A-Z][a-z]+\s+(road|street|avenue|lane|drive|close|way|place|crescent|grove|terrace|court|gardens)\b/i },
  { type: "UK postcode",               pattern: /\b[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}\b/i },
  { type: "Marital status",            pattern: /\b(married|single|divorced|widowed|civil partner)\b/i },
  { type: "Nationality",               pattern: /\bnationality[:\s]+[A-Za-z]+\b/i },
  { type: "Age",                       pattern: /\bage[:\s]+\d{1,2}\b/i },
  { type: "Religion",                  pattern: /\b(christian|muslim|jewish|hindu|sikh|buddhist|atheist|agnostic)\b/i },
  { type: "Photo",                     pattern: /\b(photo|photograph|headshot|picture)[:\s]/i },
];

// Contact details: present = good, absent = warn
const CONTACT_PATTERNS: { type: string; pattern: RegExp; advice: string }[] = [
  {
    type: "Email address",
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
    advice: "No email address found. Your email must appear at the top of your CV — use a professional address, ideally firstname.lastname@domain.com. Avoid informal or nickname-based addresses.",
  },
  {
    type: "Phone number",
    pattern: /(\+44\s?|0)(\d[\s-]?){9,10}\b/,
    advice: "No UK phone number found. Recruiters expect a phone number prominently displayed. Use the format 07xxx xxxxxx or +44 7xxx xxxxxx.",
  },
  {
    type: "LinkedIn profile",
    pattern: /linkedin\.com\/in\/[a-z0-9\-]+/i,
    advice: "No LinkedIn profile URL found. A LinkedIn profile is now expected by most UK recruiters, especially in graduate roles. Add your profile URL in the format linkedin.com/in/yourname and ensure the profile is complete and consistent with your CV.",
  },
];

// ── Action verbs library ──────────────────────────────────────────────────────
const STRONG_ACTION_VERBS = new Set([
  "achieved","administered","analysed","built","championed","collaborated",
  "coordinated","created","delivered","designed","developed","directed",
  "drove","engineered","established","executed","generated","implemented",
  "improved","increased","initiated","launched","led","managed","negotiated",
  "optimised","organised","oversaw","produced","reduced","resolved","spearheaded",
  "streamlined","supervised","transformed","accelerated","architected","automated",
  "boosted","built","contributed","cultivated","decreased","defined","enhanced",
  "expanded","facilitated","grew","guided","handled","identified","influenced",
  "integrated","mentored","migrated","modernised","partnered","pioneered",
  "planned","presented","prioritised","recruited","redesigned","reformed",
  "restructured","secured","shaped","trained","upgraded",
]);

const WEAK_VERBS = new Set([
  "helped","assisted","worked","did","made","was","were","had","got","tried",
  "involved","participated","supported","contributed to","responsible for",
  "duties included","tasks included",
]);

// ── Sector keyword database ───────────────────────────────────────────────────
// Each entry: role keywords + sector + advice templates
export const SECTOR_DATABASE: Record<string, {
  keywords: string[];
  mustHave: string[];
  niceToHave: string[];
  structureAdvice: string;
  interviewQuestions: string[];
  interviewTips: string[];
  jobBoards: { name: string; url: string; description: string }[];
}> = {
  "software-engineering": {
    keywords: [
      "javascript","typescript","python","java","c++","c#","react","node.js",
      "angular","vue","aws","azure","gcp","docker","kubernetes","ci/cd",
      "git","agile","scrum","rest api","graphql","sql","nosql","mongodb",
      "postgresql","microservices","devops","tdd","unit testing","linux",
      "object-oriented","algorithms","data structures","software development",
      "full stack","backend","frontend","version control","pull request","code review",
      "github copilot","cursor","ai-assisted development","prompt engineering",
      "rust","edge computing","mlops","websockets","grpc","terraform",
      "opentelemetry","accessibility","web performance",
    ],
    mustHave: ["programming language","version control","agile","testing"],
    niceToHave: ["cloud platform","containerisation","ci/cd","open source"],
    structureAdvice: "Lead with a technical skills section listing languages, frameworks and tools. Quantify every project outcome. Include GitHub profile or portfolio link. For each role, specify the tech stack used.",
    interviewQuestions: [
      "Walk me through a technical challenge you faced and how you resolved it.",
      "How do you approach debugging a complex system issue?",
      "Describe your experience with agile development and how you contribute to sprint planning.",
      "How do you ensure code quality in a team environment?",
      "Tell me about a project where you had to learn a new technology quickly.",
    ],
    interviewTips: [
      "Prepare two or three strong STAR examples that involve measurable technical outcomes.",
      "Research the company's tech stack before the interview and be ready to discuss it.",
      "For technical interviews, think aloud — interviewers assess your reasoning process, not just the answer.",
      "UK employers value collaborative coding culture; demonstrate how you work in teams.",
    ],
    jobBoards: [
      { name: "Dorkmyjob", url: "https://dorkmyjob.com", description: "Tech and startup roles" },
      { name: "LinkedIn Jobs", url: "https://linkedin.com/jobs", description: "Graduate and mid-level tech" },
      { name: "Stack Overflow Jobs", url: "https://stackoverflow.com/jobs", description: "Developer-specific roles" },
      { name: "CWJobs", url: "https://cwjobs.co.uk", description: "UK tech specialist" },
      { name: "Prospects", url: "https://prospects.ac.uk/jobs", description: "Graduate tech schemes" },
      { name: "Otta", url: "https://otta.com", description: "High-growth tech and modern UK companies" },
    ],
  },

  "finance-banking": {
    keywords: [
      "financial modelling","excel","vba","bloomberg","reuters","investment banking",
      "equity research","asset management","risk management","portfolio management",
      "derivatives","fixed income","equities","private equity","venture capital",
      "financial analysis","valuation","dcf","m&a","compliance","regulatory",
      "cfa","acca","aca","chartered accountant","python","sql","powerbi","tableau",
      "financial reporting","budgeting","forecasting","cashflow","p&l",
      "esg","sustainability reporting","tcfd","net zero","carbon accounting",
      "esg data analysis","responsible investment","impact investing","climate risk",
    ],
    mustHave: ["financial analysis","excel","quantitative skills","commercial awareness"],
    niceToHave: ["bloomberg","professional qualification","financial modelling","vba"],
    structureAdvice: "Highlight quantitative achievements with exact figures. Mention any relevant professional qualifications (ACCA, CFA, ACA) prominently. Commercial awareness — demonstrate you read the FT or understand current market conditions.",
    interviewQuestions: [
      "Tell me about a recent financial news story that interests you and its market implications.",
      "Walk me through a DCF valuation.",
      "How would you value a company with negative earnings?",
      "Describe a situation where you had to analyse complex data and present findings.",
      "Why do you want to work in finance rather than another professional services field?",
    ],
    interviewTips: [
      "Read the Financial Times daily in the two weeks before your interview.",
      "Be ready to discuss your favourite stock or investment thesis with conviction.",
      "UK finance interviews often include numerical tests — practice mental arithmetic.",
      "Demonstrate commercial awareness by referencing specific market events.",
    ],
    jobBoards: [
      { name: "eFinancialCareers", url: "https://efinancialcareers.co.uk", description: "Finance specialist" },
      { name: "LinkedIn Jobs", url: "https://linkedin.com/jobs", description: "All finance sectors" },
      { name: "Milkround", url: "https://milkround.com", description: "Graduate finance schemes" },
      { name: "Target Jobs", url: "https://targetjobs.co.uk", description: "Graduate finance" },
      { name: "Prospects", url: "https://prospects.ac.uk/jobs", description: "Graduate schemes" },
      { name: "Bright Network", url: "https://brightnetwork.co.uk", description: "Graduate finance and professional services schemes" },
    ],
  },

  "marketing-creative": {
    keywords: [
      "digital marketing","seo","sem","ppc","google ads","facebook ads","social media",
      "content marketing","email marketing","copywriting","brand management",
      "market research","google analytics","data analysis","a/b testing",
      "campaign management","crm","hubspot","salesforce","mailchimp",
      "photography","videography","adobe creative suite","photoshop","illustrator",
      "indesign","figma","ux","ui","brand strategy","market segmentation","roi",
    ],
    mustHave: ["digital marketing","analytics","content creation","campaign management"],
    niceToHave: ["paid media","crm tools","design tools","seo"],
    structureAdvice: "Include a portfolio link prominently. Quantify campaign results with metrics — reach, conversion rates, ROI. List specific tools and platforms. Show evidence of creative thinking through project descriptions.",
    interviewQuestions: [
      "Tell me about a campaign you ran and what the measurable results were.",
      "How do you stay current with digital marketing trends?",
      "Describe a time you had to adapt your creative approach based on data or feedback.",
      "Walk me through how you would approach launching a new product on social media.",
      "How do you balance creative instinct with data-driven decision making?",
    ],
    interviewTips: [
      "Research the company's current marketing channels before the interview and come with observations.",
      "Bring a portfolio or be ready to share a link — visual evidence of your work is essential.",
      "UK marketing teams value cultural fit and personality — be genuinely enthusiastic.",
      "Demonstrate commercial awareness: show you understand how marketing drives business outcomes.",
    ],
    jobBoards: [
      { name: "LinkedIn Jobs", url: "https://linkedin.com/jobs", description: "Marketing and creative" },
      { name: "The Drum", url: "https://thedrum.com/jobs", description: "Marketing industry" },
      { name: "Gorkana Jobs", url: "https://gorkana.com/jobs", description: "PR and communications" },
      { name: "Target Jobs", url: "https://targetjobs.co.uk", description: "Graduate marketing" },
      { name: "Indeed UK", url: "https://uk.indeed.com", description: "All marketing roles" },
    ],
  },

  "law": {
    keywords: [
      "legal research","case law","contract drafting","litigation","commercial law",
      "legal writing","advocacy","client care","due diligence","mergers","acquisitions",
      "corporate law","employment law","intellectual property","data protection","gdpr",
      "solicitor","barrister","paralegal","legal aid","conveyancing","dispute resolution",
      "mediation","arbitration","lpc","bptc","sqe","vacation scheme","training contract",
    ],
    mustHave: ["legal research","commercial awareness","attention to detail","written communication"],
    niceToHave: ["vacation scheme","pro bono","mooting","law society","negotiation competition"],
    structureAdvice: "List all vacation schemes, mini-pupillages and work experience prominently. Include university law society roles and mooting experience. Commercial awareness is critical — reference current legal sector news. Grades matter significantly — include predicted or achieved results clearly.",
    interviewQuestions: [
      "Tell me about a commercial deal or legal case in the news and your views on it.",
      "Why this firm specifically, and how does it differ from its competitors?",
      "Describe a situation where you had to analyse a complex problem under time pressure.",
      "What area of law interests you most, and why?",
      "Tell me about a time you had to persuade someone to a different point of view.",
    ],
    interviewTips: [
      "Research the firm's recent deals, cases, and practice area strengths thoroughly.",
      "Law firm interviews are highly competitive — prepare firm-specific answers, not generic ones.",
      "Demonstrate commercial awareness by referencing specific sectors the firm advises.",
      "For commercial law, show you understand how the firm makes money and serves clients.",
    ],
    jobBoards: [
      { name: "The Lawyer", url: "https://thelawyer.com/jobs", description: "Legal sector" },
      { name: "Law Careers", url: "https://lawcareers.net", description: "Graduate law" },
      { name: "RollOnFriday", url: "https://rolloonfriday.com/jobs", description: "Law firm roles" },
      { name: "Target Jobs", url: "https://targetjobs.co.uk", description: "Legal graduate schemes" },
      { name: "Prospects", url: "https://prospects.ac.uk/jobs", description: "Graduate schemes" },
      { name: "Bright Network", url: "https://brightnetwork.co.uk", description: "Graduate law and professional services" },
    ],
  },

  "healthcare-nhs": {
    keywords: [
      "patient care","clinical","nhs","healthcare","nursing","medicine","pharmacology",
      "anatomy","physiology","clinical governance","safeguarding","care planning",
      "multidisciplinary team","mdt","evidence-based practice","clinical audit",
      "health promotion","mental health","cbh","rehabilitation","palliative care",
      "infection control","gdpr","cqc","professional registration","nmc","gmc","hcpc",
      "first aid","bls","cpr","manual handling","risk assessment","communication skills",
    ],
    mustHave: ["patient care","clinical skills","teamwork","communication"],
    niceToHave: ["professional registration","voluntary work","clinical audit","research experience"],
    structureAdvice: "Include all clinical placements with the setting, patient group and key skills developed. Professional registration status should be prominent. Voluntary work in care settings adds significant value. Demonstrate reflection and continuous professional development.",
    interviewQuestions: [
      "Tell me about a time you had to handle a difficult situation with a patient or service user.",
      "How do you prioritise when managing multiple competing demands?",
      "Describe a time you worked effectively within a multidisciplinary team.",
      "What does patient-centred care mean to you in practice?",
      "How do you keep your clinical knowledge and skills up to date?",
    ],
    interviewTips: [
      "Be prepared to discuss NHS values (compassion, respect, commitment to quality) with specific examples.",
      "Reflection is central to healthcare practice — show your capacity to learn from experience.",
      "Research any recent NHS policy changes or reports relevant to your specialty.",
      "UK healthcare interviews often assess values as much as clinical competence.",
    ],
    jobBoards: [
      { name: "NHS Jobs", url: "https://jobs.nhs.uk", description: "Official NHS vacancy board" },
      { name: "Health Jobs UK", url: "https://healthjobsuk.com", description: "Healthcare and clinical" },
      { name: "Nursing Times Jobs", url: "https://jobs.nursingtimes.co.uk", description: "Nursing roles" },
      { name: "BMJ Careers", url: "https://careers.bmj.com", description: "Medical and clinical" },
      { name: "Prospects", url: "https://prospects.ac.uk/jobs", description: "Healthcare graduate schemes" },
    ],
  },

  "consulting": {
    keywords: [
      "problem solving","structured thinking","client management","stakeholder engagement",
      "project management","data analysis","powerpoint","excel","presentation skills",
      "change management","process improvement","research","benchmarking","strategy",
      "business case","recommendation","hypothesis-driven","mece","case study",
      "prince2","agile","lean","six sigma","management consulting","business analysis",
      "esg strategy","sustainability consulting","net zero roadmap","carbon footprint",
      "scope 1 2 3","sustainable supply chain",
    ],
    mustHave: ["analytical skills","structured communication","stakeholder management","problem solving"],
    niceToHave: ["case study experience","pro bono consulting","project management certification","data skills"],
    structureAdvice: "Lead every bullet point with a quantified outcome. Structure your experience using the situation-action-result format. Highlight leadership and any instances of driving change. Case interview preparation is essential — demonstrate structured thinking in how you describe projects.",
    interviewQuestions: [
      "Walk me through a time you solved a complex problem using data.",
      "How many golf balls fit in a Boeing 747? (market sizing example)",
      "A client's revenue has declined 20% in 12 months. How would you structure your analysis?",
      "Describe a time you had to influence a senior stakeholder.",
      "Why consulting, and why this firm specifically?",
    ],
    interviewTips: [
      "Practice case interview frameworks (McKinsey, BCG, Bain style) using Case in Point or Victor Cheng.",
      "Structure every answer — interviewers assess your thinking process as much as the answer.",
      "Research the firm's recent projects, publications and areas of focus.",
      "UK consulting firms value intellectual curiosity — demonstrate breadth of interests.",
    ],
    jobBoards: [
      { name: "LinkedIn Jobs", url: "https://linkedin.com/jobs", description: "Consulting and strategy" },
      { name: "Target Jobs", url: "https://targetjobs.co.uk", description: "Graduate consulting" },
      { name: "Consulting Point", url: "https://consultingpoint.com", description: "Consulting specific" },
      { name: "Milkround", url: "https://milkround.com", description: "Graduate schemes" },
      { name: "Prospects", url: "https://prospects.ac.uk/jobs", description: "Graduate schemes" },
      { name: "Bright Network", url: "https://brightnetwork.co.uk", description: "Graduate consulting schemes" },
    ],
  },

  "engineering": {
    keywords: [
      "autocad","solidworks","matlab","ansys","catia","finite element analysis","fea",
      "cad","cam","mechanical engineering","civil engineering","structural engineering",
      "electrical engineering","chemical engineering","thermodynamics","fluid dynamics",
      "project management","iso","bs en","asme","manufacturing","lean","six sigma",
      "technical drawing","tolerance","prototyping","testing","quality assurance",
      "bim","revit","staad","site management","hs&e","health and safety","cdm",
      "hydraulics","pneumatics","plc","instrumentation","commissioning","maintenance",
      "sustainability","net zero","renewable energy","structural analysis","geotechnics",
    ],
    mustHave: ["cad software","engineering analysis","project management","health and safety"],
    niceToHave: ["professional accreditation","chartership","bim","site experience"],
    structureAdvice: "List engineering software proficiency prominently. Include any accredited degree classification (MEng preferred by employers for chartership). Quantify project scale — value, capacity, load, area. For civil and structural roles, BIM experience is increasingly essential. Include any institution membership (IMechE, ICE, IET, IChemE).",
    interviewQuestions: [
      "Describe a technical project you completed from brief to delivery. What were the key engineering challenges?",
      "How do you approach a problem where the solution is not immediately apparent?",
      "Tell me about a time you identified a safety risk and how you handled it.",
      "How do you balance engineering rigour with project deadlines and budget constraints?",
      "What area of engineering most interests you and why, with reference to current industry developments?",
    ],
    interviewTips: [
      "UK engineering employers expect knowledge of relevant British Standards and regulatory frameworks — research these for your discipline.",
      "Chartership is a long-term goal employers invest in — demonstrate awareness of the pathway (CEng, IEng) relevant to your institution.",
      "Quantify everything: loads, dimensions, budgets, timescales, team sizes.",
      "Demonstrate awareness of sustainability and net zero targets — these are now central to almost every engineering discipline in the UK.",
    ],
    jobBoards: [
      { name: "New Civil Engineer Jobs", url: "https://jobs.newcivilengineer.com", description: "Civil and structural" },
      { name: "The Engineer Jobs", url: "https://jobs.theengineer.co.uk", description: "All engineering disciplines" },
      { name: "Prospects", url: "https://prospects.ac.uk/jobs", description: "Graduate engineering schemes" },
      { name: "Indeed UK", url: "https://uk.indeed.com", description: "All engineering roles" },
      { name: "LinkedIn Jobs", url: "https://linkedin.com/jobs", description: "Graduate and experienced" },
      { name: "Gradcracker", url: "https://gradcracker.com", description: "STEM graduate roles and schemes" },
    ],
  },

  "civil-service": {
    keywords: [
      "policy","stakeholder engagement","ministerial briefing","parliamentary","legislation",
      "public sector","government","civil service","fast stream","making effective decisions",
      "seeing the big picture","changing and improving","leading and communicating",
      "collaborating and partnering","delivering at pace","managing a quality service",
      "building capability","analysis","research","strategy","consultation","procurement",
      "project delivery","public administration","gdpr","freedom of information","foi",
      "equality diversity inclusion","edi","value for money","accountability","transparency",
    ],
    mustHave: ["civil service behaviours","stakeholder engagement","analytical skills","written communication"],
    niceToHave: ["fast stream","policy experience","parliamentary knowledge","public sector"],
    structureAdvice: "Civil Service applications are competency-based. Every example must map explicitly to one of the Civil Service Behaviours. Use the STAR format strictly. Your personal statement should demonstrate public service motivation clearly. If applying for Fast Stream, showcase leadership and ambiguity tolerance. Grades and degree discipline matter less than evidence-based examples.",
    interviewQuestions: [
      "Give me an example of a time you used evidence and analysis to influence a decision.",
      "Describe a situation where you had to work collaboratively across organisational boundaries to achieve an outcome.",
      "Tell me about a time you delivered a piece of work to a high standard under significant time pressure.",
      "How do you ensure that different perspectives and stakeholder needs are considered in your work?",
      "Describe a time you identified an opportunity to improve a process or service and what you did about it.",
    ],
    interviewTips: [
      "Study the Civil Service Behaviours framework thoroughly — every answer must map to a named behaviour.",
      "The Civil Service values impartiality, integrity, honesty and objectivity — weave these into your answers naturally.",
      "Practice STAR answers to a strict 2-minute verbal length — Civil Service interviews are highly structured.",
      "Research the specific department's current priorities and policy agenda before interview.",
    ],
    jobBoards: [
      { name: "Civil Service Jobs", url: "https://civilservicejobs.service.gov.uk", description: "Official government vacancy board" },
      { name: "Civil Service Fast Stream", url: "https://faststream.gov.uk", description: "Graduate Fast Stream programme" },
      { name: "Prospects", url: "https://prospects.ac.uk/jobs", description: "Public sector graduate roles" },
      { name: "LinkedIn Jobs", url: "https://linkedin.com/jobs", description: "Public sector and policy" },
      { name: "Guardian Jobs", url: "https://jobs.theguardian.com", description: "Public sector and charity" },
    ],
  },

  "education": {
    keywords: [
      "teaching","lesson planning","curriculum","ofsted","sen","safeguarding","behaviour management",
      "differentiation","assessment","feedback","marking","pastoral care","parent engagement",
      "qts","pgce","school direct","early career teacher","ect","ks1","ks2","ks3","ks4",
      "gcse","a level","primary","secondary","special educational needs","inclusion",
      "classroom management","subject knowledge","learning outcomes","progress tracking",
      "mentoring","tuition","higher education","lecturing","module design","research",
      "dbs","prevent","british values","relationships education","rshe",
    ],
    mustHave: ["qts or pgce","safeguarding","lesson planning","behaviour management"],
    niceToHave: ["sen experience","pastoral responsibility","subject specialism","ofsted knowledge"],
    structureAdvice: "Lead with your teaching qualification and DBS status. For school roles, specify key stages and subject specialism clearly. Safeguarding training date must be current and visible. Placement schools and age ranges taught are essential detail. For higher education, list publications, modules taught and research interests. Quantify pupil progress and attainment outcomes where possible.",
    interviewQuestions: [
      "Describe a lesson that went particularly well. What made it effective, and what would you change?",
      "Tell me about a time you adapted your teaching approach to support a pupil with additional needs.",
      "How do you manage challenging behaviour while maintaining a positive classroom environment?",
      "Describe your approach to assessment and how you use data to inform your teaching.",
      "What does safeguarding mean to you in practice, and can you give an example of applying it?",
    ],
    interviewTips: [
      "Safeguarding will be discussed in every teaching interview — know Keeping Children Safe in Education (KCSiE) thoroughly.",
      "UK schools are increasingly data-driven — be prepared to discuss how you track and respond to pupil attainment data.",
      "Demonstrate awareness of current Ofsted inspection framework and what it means for your practice.",
      "For primary roles, show breadth across the curriculum; for secondary, demonstrate deep subject knowledge and exam board awareness.",
    ],
    jobBoards: [
      { name: "TES Jobs", url: "https://tes.com/jobs", description: "Teaching and education roles" },
      { name: "Teach in FE", url: "https://teachinfe.co.uk", description: "Further education sector" },
      { name: "Indeed UK", url: "https://uk.indeed.com", description: "All education roles" },
      { name: "Prospects", url: "https://prospects.ac.uk/jobs", description: "Graduate education schemes" },
      { name: "LinkedIn Jobs", url: "https://linkedin.com/jobs", description: "Education and training" },
      { name: "Handshake", url: "https://joinhandshake.co.uk", description: "University-vetted graduate roles" },
    ],
  },

  "cybersecurity": {
    keywords: [
      "penetration testing","ethical hacking","ctf","tryhackme","hackthebox",
      "burp suite","metasploit","nmap","kali linux","owasp",
      "sql injection","xss","privilege escalation","reverse engineering","exploit development",
      "siem","soc","threat intelligence","incident response","digital forensics",
      "wireshark","splunk","vulnerability assessment","intrusion detection","endpoint security",
      "gdpr","iso 27001","nist","cyber essentials","risk assessment",
      "security audit","data protection","comptia security+","ceh","crest cpsa",
      "oscp","cissp","zero trust","cloud security","devsecops","threat modelling",
    ],
    mustHave: ["networking fundamentals","linux","scripting","security concepts"],
    niceToHave: ["ctf participation","home lab","certifications in progress","write-up blog"],
    structureAdvice: "Replace a generic Interests section with a Labs & CTFs section listing your TryHackMe and HackTheBox rank, specific machines or challenges completed, and any CTF competition placements. Compliance literacy (GDPR, ISO 27001, NIST) must appear in your skills section — UK employers expect security professionals to understand the regulatory environment, not only the technical attack surface. Certifications in progress should be listed openly as 'Studying towards: CompTIA Security+ (target Q3)' rather than omitted — employers value the trajectory.",
    interviewQuestions: [
      "Walk me through how you would approach a black-box penetration test of a web application from initial enumeration through to reporting.",
      "Describe a TryHackMe room or HackTheBox machine that genuinely challenged you — what was the foothold, the privilege escalation path, and what did you learn from it?",
      "How do GDPR and ISO 27001 obligations shape the way an organisation should respond to a confirmed data breach?",
      "The UK has a well-documented cyber skills shortage and the NCSC has been vocal about the talent gap. Why are you choosing this career path now, and where do you want to specialise?",
      "Explain the difference between a vulnerability, a threat and a risk, and walk me through how you would prioritise remediation across a backlog of 50 findings.",
    ],
    interviewTips: [
      "Familiarise yourself with the NCSC CyberFirst pathways and the UK Cyber Security Council professional registration framework — these are increasingly cited in graduate scheme interviews.",
      "Be clear on whether you are positioning yourself as red team (offensive — pen testing, exploit development) or blue team (defensive — SOC, incident response, threat hunting). Most graduates do better entering blue team and pivoting later.",
      "A public GitHub of write-ups, scripts and CTF solutions or a personal blog (GitHub Pages is free) is now an expected differentiator — employers will look for it before interview.",
      "UK employers in regulated sectors (finance, healthcare, government) test for compliance awareness as much as technical depth. Be ready to discuss GDPR, the Data Protection Act 2018 and Cyber Essentials.",
    ],
    jobBoards: [
      { name: "CyberSecurityJobs", url: "https://cybersecurityjobs.com", description: "Cyber-specialist board, UK and global" },
      { name: "NCSC Careers", url: "https://ncsc.gov.uk/careers", description: "National Cyber Security Centre roles" },
      { name: "CW Jobs (Security)", url: "https://cwjobs.co.uk", description: "UK tech specialist, filter to security" },
      { name: "LinkedIn Jobs", url: "https://linkedin.com/jobs", description: "Graduate and experienced cyber roles" },
      { name: "Indeed UK", url: "https://uk.indeed.com", description: "All cyber and information security roles" },
    ],
  },

  "data-analysis": {
    keywords: [
      "python","pandas","numpy","sql","excel","r","jupyter notebook",
      "tableau","power bi","matplotlib","seaborn","plotly","looker",
      "statistical modelling","hypothesis testing","regression analysis","a/b testing",
      "probability","descriptive statistics","scikit-learn","machine learning",
      "feature engineering","model evaluation","classification","clustering",
      "dbt","airflow","spark","bigquery","snowflake","data pipeline",
      "etl","api integration","web scraping","data storytelling","stakeholder communication",
      "requirements gathering","llm fine-tuning","vector databases","prompt engineering",
      "responsible ai","data governance",
    ],
    mustHave: ["sql","excel","data visualisation","statistical reasoning"],
    niceToHave: ["python","cloud data warehouse","public portfolio","domain experience"],
    structureAdvice: "Every project must follow the data storytelling pattern: state the business question answered, the dataset used (size and source), the method applied, and the actionable insight delivered — not just 'I cleaned data and ran a model'. Distinguish carefully between data analyst roles (SQL, Excel, BI tools, dashboarding) and data scientist roles (Python, statistics, machine learning) — UK postings use the titles inconsistently and your CV should be tailored to the specific posting language. List tools by category (languages, BI, cloud) for ATS clarity.",
    interviewQuestions: [
      "Write a SQL query to find the top three customers by revenue per region from a sales table — talk me through your approach before you write it.",
      "Imagine a marketing director asks you to 'tell me what's happening with our customers'. The brief is vague. How do you turn this into a project, and how do you communicate findings back?",
      "When would you choose logistic regression over a random forest for a binary classification problem, and how would you explain that choice to a non-technical stakeholder?",
      "You receive a dataset with 30% missing values in your most important column. Walk me through how you investigate and handle this before any modelling.",
      "Tell me about a time your analysis led to a specific decision being made — what was the insight, who was the audience, and what action followed?",
    ],
    interviewTips: [
      "Practice SQL on Mode Analytics, StrataScratch or DataLemur before any data interview — UK employers screen heavily on SQL fluency at all levels.",
      "A public portfolio is now expected: a Kaggle profile with at least one notebook, a GitHub with a project repository, or a personal site with two or three write-ups.",
      "The insight matters more than the technique. A simple regression with a clearly communicated business action beats a sophisticated model with no narrative.",
      "UK market reality: most 'data analyst' roles in finance, retail and the public sector require strong SQL and Excel before Python is even discussed. Lead your CV with the right tool order for the posting.",
    ],
    jobBoards: [
      { name: "Kaggle Jobs", url: "https://kaggle.com/jobs", description: "Data science specialist board" },
      { name: "Analytics Vidhya Jobs", url: "https://jobs.analyticsvidhya.com", description: "Data and analytics roles" },
      { name: "LinkedIn Jobs", url: "https://linkedin.com/jobs", description: "Graduate and experienced data roles" },
      { name: "Indeed UK", url: "https://uk.indeed.com", description: "All data analyst and BI roles" },
      { name: "Otta", url: "https://otta.com", description: "Best for data roles at growth-stage UK companies" },
    ],
  },
};

// ── Role normaliser ───────────────────────────────────────────────────────────
export function normaliseSector(roleInput: string): string {
  const role = roleInput.toLowerCase();
  // Civil Service — check before generic engineer to avoid "civil engineer" false match
  if (/civil service|fast stream|policy|government|public sector|whitehall|parliament|minister|home office|cabinet office/.test(role)) return "civil-service";
  // Education
  if (/teach|lectur|education|school|pgce|qts|ect|early career teacher|tutor|headteach|senco|primary|secondary|further education|university|academic/.test(role)) return "education";
  // Engineering — mechanical, civil, structural, electrical, chemical etc — but NOT software
  if (/\b(mechanical|civil|structural|electrical|chemical|aerospace|automotive|manufacturing|process|geo|environmental|building services)\s*engineer|\bengineer(ing)?\b(?!.*software)/.test(role)) return "engineering";
  // Cybersecurity — must be checked BEFORE software-engineering catch-all
  if (/cyber|cybersecurity|security analyst|penetration test|pen test|soc analyst|ethical hack|infosec|information security|ctf|tryhackme|hackthebox|incident response|digital forensics|threat intel|devsecops|red team|blue team/.test(role)) return "cybersecurity";
  // Data analysis — must be checked BEFORE software-engineering catch-all
  if (/data analyst|data analysis|data science|data scientist|business intelligence|bi analyst|bi developer|analytics|machine learning engineer|ml engineer|data engineer|etl|tableau|power bi|kaggle|statistician/.test(role)) return "data-analysis";
  // Software / data / tech
  if (/software|developer|programmer|devops|frontend|backend|full.?stack|data\s*(scientist|engineer|analyst)|machine learning|ai engineer|cloud|sre|platform engineer/.test(role)) return "software-engineering";
  // Finance
  if (/finance|banking|investment|equity|asset|portfolio|trading|accounting|audit|acca|aca|cfa|actuar/.test(role)) return "finance-banking";
  // Marketing
  if (/marketing|brand|content|social media|seo|digital|creative|pr|communications|advertising|copywrite/.test(role)) return "marketing-creative";
  // Law
  if (/law|legal|solicitor|barrister|paralegal|lpc|sqe|training contract|chambers/.test(role)) return "law";
  // Healthcare
  if (/nhs|health|nurse|doctor|clinical|medical|physio|pharmacist|care|midwife|dentist|radiograph|paramedic/.test(role)) return "healthcare-nhs";
  // Consulting
  if (/consult|strategy|management consult|business analyst|advisory|mckinsey|deloitte|pwc|kpmg|ey\b/.test(role)) return "consulting";
  // Default — software has the broadest keyword set so works as fallback
  return "software-engineering";
}

// ── Text utilities ────────────────────────────────────────────────────────────
function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s\.\+\#]/g, " ")
    .split(/\s+/)
    .filter(t => t.length > 1);
}

function buildBigrams(tokens: string[]): string[] {
  const bigrams: string[] = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    bigrams.push(tokens[i] + " " + tokens[i + 1]);
  }
  return bigrams;
}

// ── Section detector ──────────────────────────────────────────────────────────
function detectSections(text: string): Record<string, boolean> {
  const lower = text.toLowerCase();
  return {
    hasSummary:     /\b(personal\s+statement|profile|summary|objective|about\s+me)\b/.test(lower),
    hasExperience:  /\b(experience|employment|work\s+history|career\s+history|positions?\s+held)\b/.test(lower),
    hasEducation:   /\b(education|qualifications?|academic|university|degree|a[\s-]?levels?|gcse)\b/.test(lower),
    hasSkills:      /\b(skills|competencies|technical\s+skills|core\s+competencies|expertise)\b/.test(lower),
    hasAchievements:/\b(achievements?|accomplishments?|awards?|honours?)\b/.test(lower),
    hasReferences:  /\b(references?|referees?)\b/.test(lower),
    hasHobbies:     /\b(hobbies|interests|activities|volunteering|volunteer)\b/.test(lower),
    hasProjects:    /\b(projects?|portfolio|personal\s+project|side\s+project|dissertation|final\s+year|capstone|hackathon|open.?source)\b/.test(lower),
  };
}

// ── Per-sector projects advice ────────────────────────────────────────────────
// What a good project looks like, what to add if absent, how to analyse what's there
const PROJECTS_ADVICE: Record<string, {
  importance: "essential" | "highly recommended" | "useful";
  whatToHighlight: string[];
  ifAbsent: string;
  ifPresent: string;
  exampleProjects: string[];
}> = {
  "software-engineering": {
    importance: "essential",
    whatToHighlight: [
      "The specific technologies used (language, framework, library, cloud platform)",
      "The problem the project solved and for whom",
      "Any measurable outcome — users, performance improvement, lines of code, stars on GitHub",
      "Your individual contribution if it was a team project",
      "A link to a live deployment or GitHub repository",
    ],
    ifAbsent: "Software engineering roles at graduate level almost always expect a projects section. With limited work experience, projects are your primary evidence of technical ability. Build at minimum one end-to-end project before applying: a web app, CLI tool, or API with a clear purpose. Host it on GitHub with a descriptive README. Consider: a personal finance tracker, a REST API for a topic you care about, a browser extension, or a data scraper with visualisation.",
    ifPresent: "Projects section detected. For each project ensure you state: the tech stack used, the purpose and end user, your specific role, and a quantified outcome or link. Avoid listing projects without context — 'built a website' tells a recruiter nothing. 'Built a React/Node.js event booking platform used by 200 students, reducing admin time by 60%' is a strong entry.",
    exampleProjects: [
      "Full-stack web application (React + Node.js or Django) solving a real problem",
      "REST API with authentication, deployed to AWS or Heroku",
      "CLI tool or automation script with clear utility",
      "Open source contribution with documented PR history",
      "Hackathon project with a brief outcome summary",
    ],
  },

  "finance-banking": {
    importance: "highly recommended",
    whatToHighlight: [
      "Any financial modelling work — DCF, LBO, comparable companies",
      "Data analysis projects using Excel, Python, R or SQL",
      "University modules with a quantitative or financial focus",
      "Investment or trading simulations (e.g. university investment society portfolio)",
      "Research reports or dissertations on finance topics",
    ],
    ifAbsent: "Finance employers value demonstrated commercial and analytical ability. If you have no formal projects, consider: joining your university's investment society and managing a mock portfolio, completing a free Bloomberg Market Concepts certification, building a simple DCF model in Excel for a public company you admire, or writing a short equity research note. These can be listed under Projects or Interests.",
    ifPresent: "Projects detected. For finance roles, ensure any project demonstrates quantitative rigour. State your methodology, data sources, and conclusions. A well-presented DCF model or financial analysis project can differentiate you from candidates with similar grades and work experience.",
    exampleProjects: [
      "DCF or LBO model for a real company using public filings",
      "University investment society — mock portfolio with stated returns",
      "Econometrics or financial data analysis using Python or R",
      "Industry research report (3–5 pages) on a sector of interest",
      "Bloomberg Market Concepts certification",
    ],
  },

  "marketing-creative": {
    importance: "essential",
    whatToHighlight: [
      "Campaigns you ran — platform, audience size, measurable results (reach, engagement rate, conversions)",
      "Content created — articles, videos, social posts, with performance metrics",
      "Tools used — Google Analytics, HubSpot, Meta Ads Manager, Mailchimp, Canva, Adobe",
      "Portfolio link — crucial for creative roles",
      "University society marketing roles or charity campaigns",
    ],
    ifAbsent: "Marketing and creative roles require a portfolio. Without one, your application is significantly weaker. Start immediately: create social media content for a cause or student society and document the results, write three blog posts on a marketing topic and publish them, run a small paid social campaign (even £10 on Meta), or redesign a brand identity as a concept project. Document outcomes meticulously.",
    ifPresent: "Projects or portfolio detected. Ensure every entry includes specific metrics — engagement rate, follower growth, conversion rate, traffic generated. Recruiters in marketing are sceptical of unquantified claims. A link to a live portfolio or published work is essential for creative roles.",
    exampleProjects: [
      "Social media campaign with documented reach and engagement data",
      "Content marketing project — blog, video series, or newsletter with subscriber count",
      "University society rebrand or marketing campaign",
      "Google Ads or Meta Ads campaign with ROAS or conversion data",
      "SEO project showing organic traffic growth over time",
    ],
  },

  "law": {
    importance: "useful",
    whatToHighlight: [
      "Mooting competitions — rounds reached, any wins",
      "Pro bono legal work or law clinic involvement",
      "Legal research projects or dissertation on a legal topic",
      "Negotiation or client interviewing competitions",
      "Case studies or journal articles written",
    ],
    ifAbsent: "For law applications, extracurricular legal activity matters more than standalone projects. If you have none, join your university's law society, enter a mooting or negotiation competition, or volunteer at a law clinic. These demonstrate practical legal skills and are expected at training contract and pupillage level. A dissertation on a relevant legal topic can substitute if well-presented.",
    ifPresent: "Legal extracurricular activity detected. For training contract applications, ensure mooting, pro bono and competition experience is presented clearly with outcomes. Firms want to see you have sought out legal experience beyond the lecture hall.",
    exampleProjects: [
      "Mooting competition — state rounds reached and any awards",
      "Pro bono clinic — case types handled and skills developed",
      "Legal research project or dissertation with a commercial law angle",
      "Client interviewing or negotiation competition",
      "Student law journal article or case note",
    ],
  },

  "healthcare-nhs": {
    importance: "useful",
    whatToHighlight: [
      "Research projects, audits or quality improvement initiatives",
      "Dissertation or literature review topic and findings",
      "Voluntary work in care settings — patient group, duration, skills",
      "Simulation or clinical skills training beyond the curriculum",
      "Public health campaigns or health promotion projects",
    ],
    ifAbsent: "Healthcare employers value evidence of engagement beyond the curriculum. If you have no projects to list, consider: volunteering in a care setting and documenting the experience, participating in a clinical audit at a placement, or presenting a case study at a student conference. A dissertation or extended piece of research is worth featuring prominently if you have limited clinical experience.",
    ifPresent: "Research or project experience detected. For NHS and clinical roles, frame any project in terms of patient outcomes, service improvement, or evidence-based practice. Quantify where possible — number of patients seen, audit sample size, improvement measured.",
    exampleProjects: [
      "Clinical audit or quality improvement project on placement",
      "Research dissertation with methodology, sample, and key findings",
      "Public health campaign — target population and measurable outcome",
      "Volunteer work in a care home, hospice, or hospital — duration and patient group",
      "Simulation training or advanced clinical skills course",
    ],
  },

  "consulting": {
    importance: "highly recommended",
    whatToHighlight: [
      "Pro bono consulting projects (180 Degrees Consulting, Enactus, university consulting societies)",
      "Business case competitions — rounds reached, approach taken",
      "Research projects with a strategic or commercial angle",
      "Any project where you identified a problem, structured an approach, and presented recommendations",
      "Data analysis or market research with business implications",
    ],
    ifAbsent: "Consulting applications are highly competitive and projects demonstrate the structured thinking firms assess in case interviews. If you have none: join a pro bono consulting society (180 Degrees Consulting operates at many UK universities), enter a business case competition (L'Oreal Brandstorm, Unilever Future Leaders League), or document a personal project where you applied a structured problem-solving approach.",
    ifPresent: "Project or case competition experience detected. For consulting applications, frame each entry as a structured problem-solving exercise: what was the client's challenge, what was your approach, what did you recommend, what was the outcome. This directly mirrors how consulting interviews are structured.",
    exampleProjects: [
      "Pro bono consulting project (180 Degrees Consulting or equivalent)",
      "Business case competition with stated methodology and outcome",
      "Market entry analysis or feasibility study",
      "Data analysis project with a commercial recommendation",
      "University research project with strategic implications",
    ],
  },

  "engineering": {
    importance: "essential",
    whatToHighlight: [
      "Design projects — specify the brief, your approach, materials/methods, and outcome",
      "Group design projects — clarify your individual role and contribution",
      "Final year or capstone project — topic, methodology, result, and any award",
      "CAD models, simulations, or prototypes — name the software used (AutoCAD, SolidWorks, ANSYS)",
      "Any project involving fabrication, testing, or site work",
    ],
    ifAbsent: "Engineering employers expect to see design and technical projects. If you have limited project experience, highlight any laboratory work, group design modules, or personal builds. Even a personal engineering project (3D printing, electronics, model structures) demonstrates practical interest and is worth including. For graduate roles, your final year project is often the most significant entry on your CV.",
    ifPresent: "Engineering project experience detected. Ensure each project states the engineering challenge, your specific methodology, software used, and the outcome or specification achieved. For accreditation pathways (CEng/IEng), engineering projects are portfolio evidence — describe them with sufficient technical detail.",
    exampleProjects: [
      "Final year design project — topic, method, software used, and result achieved",
      "Group design-build-test project — your role and the engineering outcome",
      "CAD modelling project using SolidWorks, AutoCAD, or Revit",
      "FEA or CFD simulation with stated boundary conditions and results",
      "Personal build project — electronics, structural, mechanical or environmental",
    ],
  },

  "civil-service": {
    importance: "useful",
    whatToHighlight: [
      "Research or policy analysis projects demonstrating evidence-based thinking",
      "Any project involving public engagement, consultation, or community work",
      "Dissertation or extended essay with a policy or governance angle",
      "University society leadership roles framed as project delivery",
      "Voluntary or community projects demonstrating public service motivation",
    ],
    ifAbsent: "The Civil Service values evidence of working in the public interest. If you have no formal projects, consider: volunteering with a local council, charity, or community organisation; completing an online policy analysis exercise; or framing your dissertation or final year project in terms of its public interest implications. The Fast Stream particularly values breadth of engagement beyond academia.",
    ifPresent: "Project experience detected. For Civil Service applications, frame projects in terms of Civil Service Behaviours — particularly 'Seeing the Big Picture', 'Delivering at Pace', and 'Changing and Improving'. Connect your project work to public benefit wherever credible.",
    exampleProjects: [
      "Policy analysis or research project on a public sector topic",
      "Community or volunteering project with a measurable social outcome",
      "University society leadership — frame as project delivery with stakeholders",
      "Dissertation with policy or governance implications",
      "Participation in a public consultation or student government",
    ],
  },

  "education": {
    importance: "useful",
    whatToHighlight: [
      "Lesson plans, schemes of work, or curriculum resources developed",
      "Tutoring experience — subject, age group, duration, and any measurable progress",
      "PGCE or School Direct placement outcomes — year group, school type, subject",
      "Educational research or dissertation on pedagogy",
      "Any projects involving young people, mentoring, or skills development",
    ],
    ifAbsent: "If you have no formal teaching projects, consider: offering free tutoring to A-level students in your subject specialism, volunteering with a youth organisation such as a sports club, Scout group, or mentoring scheme, or developing a sample scheme of work or set of lesson plans for your subject. These demonstrate pedagogical thinking and commitment to young people.",
    ifPresent: "Teaching or educational project experience detected. Ensure placement detail includes: year group taught, school type (state/independent, urban/rural, SEN provision), subject and examination board, and any notable outcomes. Specific is always better than vague — 'taught Year 9 GCSE English Literature at a mixed comprehensive' is far more informative than 'secondary school placement'.",
    exampleProjects: [
      "PGCE or School Direct placement — detailed with year group, subject, school context",
      "Private tutoring — subject, level, duration, and progress achieved",
      "Educational resource or lesson plan series developed",
      "Mentoring or youth work — organisation, young people's age group, your role",
      "Educational research project or dissertation on a pedagogical approach",
    ],
  },

  "cybersecurity": {
    importance: "essential",
    whatToHighlight: [
      "TryHackMe rank or HackTheBox profile — state your current rank or tier and link to your public profile",
      "Specific HackTheBox machines or TryHackMe rooms compromised — name them with difficulty rating",
      "CTF competition placements — event name, your team, and any award or leaderboard position",
      "Home lab setup — virtualised network, tooling installed, scenarios practised",
      "Public write-ups or a personal security blog — link the URL and list a few topics covered",
      "Certifications in progress — 'Studying towards: CompTIA Security+ (target Q3)' demonstrates commitment",
    ],
    ifAbsent: "Cybersecurity roles at graduate level expect demonstrable hands-on practice — a degree alone is rarely enough. Create a free TryHackMe account today and complete the 'Pre-Security' and 'SOC Level 1' learning paths. Document every machine you compromise: target, foothold, privilege escalation path, tools used. Start a free write-up blog on GitHub Pages and publish your first three solves. Free starting points: TryHackMe (tryhackme.com), HackTheBox Academy free tier, OverTheWire Bandit wargames, and the PortSwigger Web Security Academy. Within four weeks of consistent practice you will have enough material for a credible Labs & CTFs section.",
    ifPresent: "Lab or CTF experience detected. Present it professionally: state your current TryHackMe rank or HackTheBox tier, list machines compromised with their difficulty rating (Easy/Medium/Hard), name the tools and methodology used (enumeration, exploitation, post-exploitation), and link to any write-ups. A short methodology note ('I follow a standard recon → enumerate → exploit → escalate workflow') tells employers you think structurally, not just technically.",
    exampleProjects: [
      "TryHackMe Top 1% rank with completed SOC Level 1 and Junior Penetration Tester paths — link to public profile",
      "HackTheBox — five Easy and two Medium machines compromised; write-ups published on GitHub Pages",
      "Capture the Flag participation — National Cyber Security Centre CyberFirst Girls/CyberStart, BSides UK CTF, or HTB University CTF",
      "Home lab — virtualised Active Directory environment in VirtualBox running Kali, vulnerable Windows DC and pfSense firewall for practising lateral movement",
      "Personal write-up blog hosted on GitHub Pages — at least five rooms or machines documented end-to-end with screenshots",
    ],
  },

  "data-analysis": {
    importance: "essential",
    whatToHighlight: [
      "The business question your project answered — not 'I analysed sales data' but 'I investigated why repeat purchases dropped 18%'",
      "The dataset — source (Kaggle, public API, scraped, internal), size in rows, time period covered",
      "The methodology — SQL joins and CTEs used, statistical tests applied, models fitted with their evaluation metrics",
      "The insight delivered — what did you find, expressed as a single clear sentence",
      "The visualisation or dashboard — link to the Tableau Public, Power BI, GitHub notebook or live dashboard",
    ],
    ifAbsent: "Data roles require a portfolio — a CV without projects is materially weaker than one with even one well-documented analysis. Go to Kaggle (kaggle.com/datasets) and pick a free dataset today. Three beginner-friendly project types that map directly to UK graduate JDs: (1) Sales analysis — pick a public retail dataset, build a SQL or Pandas analysis answering a specific commercial question, visualise in Tableau Public or Power BI; (2) Customer segmentation — apply k-means clustering to a marketing dataset and explain the segments in plain English; (3) Public health EDA — use NHS Digital or ONS open data to investigate a specific question (e.g. regional A&E waiting times). Publish each as a Kaggle notebook or a GitHub repository with a clear README, then link both from your CV.",
    ifPresent: "Data project experience detected. Ensure each entry follows the four-part data storytelling structure: 'I analysed [dataset] to answer [business question], using [method], and found [insight] which led to [action or recommendation].' Vague entries like 'cleaned and analysed data using Python' tell a recruiter nothing — replace them with specific, outcome-led language.",
    exampleProjects: [
      "Sales analysis — UK supermarket sales dataset (Kaggle, 1M rows), SQL + Tableau Public dashboard answering 'which product categories drive repeat visits?'",
      "Customer segmentation — RFM analysis with k-means clustering on a marketing dataset; segments documented in a notebook on Kaggle",
      "Public health EDA — NHS Digital A&E attendance data, time-series analysis in Python with a Power BI dashboard published",
      "End-to-end ML project — house price prediction with feature engineering, model comparison and evaluation metrics in a GitHub repo",
      "A/B test analysis — simulated or public experiment data, frequentist and Bayesian comparison with stakeholder-friendly write-up",
    ],
  },
};
function hasMetrics(text: string): boolean {
  return /\d+[\s%]*(per\s+cent|percent|%|students?|customers?|clients?|users?|people|members?|projects?|hours?|days?|weeks?|months?|years?|revenue|sales?|increase|decrease|reduction|improvement|saving)/.test(text.toLowerCase());
}

// ── Count quantified bullets ──────────────────────────────────────────────────
function countQuantifiedBullets(text: string): number {
  const bullets = text.split(/[\n\r]/).filter(l => /^[\s•\-\*>]/.test(l) || l.trim().length > 20);
  return bullets.filter(b => /\d+/.test(b)).length;
}

// ── Count strong action verbs ─────────────────────────────────────────────────
function countStrongVerbs(tokens: string[]): number {
  return tokens.filter(t => STRONG_ACTION_VERBS.has(t)).length;
}

function countWeakVerbs(text: string): number {
  let count = 0;
  for (const v of WEAK_VERBS) {
    const re = new RegExp(`\\b${v}\\b`, "gi");
    const matches = text.match(re);
    if (matches) count += matches.length;
  }
  return count;
}

// ── Employment gap detection ──────────────────────────────────────────────────
// Heuristic: extract all 4-digit years (2018..current+1) from the CV text and
// check whether any year between the earliest and latest mentioned is absent.
// A missing intervening year suggests an unaccounted-for gap of ~12 months or
// more. The pattern uses a simple bounded character class to avoid any
// backtracking risk on pathological inputs.
function detectEmploymentGap(cvText: string): boolean {
  const currentYear = new Date().getFullYear();
  const minYear = 2018;
  const maxYear = currentYear + 1; // include "expected 2026" style entries
  const yearMatches = cvText.match(/\b20[1-9][0-9]\b/g) || [];
  const years = new Set<number>();
  for (const y of yearMatches) {
    const n = parseInt(y, 10);
    if (n >= minYear && n <= maxYear) years.add(n);
  }
  if (years.size < 2) return false;
  const sorted = Array.from(years).sort((a, b) => a - b);
  const earliest = sorted[0];
  const latest = sorted[sorted.length - 1];
  if (latest - earliest < 2) return false;
  // If any year between earliest and latest is missing, treat as a potential gap
  for (let y = earliest + 1; y < latest; y++) {
    if (!years.has(y)) return true;
  }
  return false;
}

// ── CV length assessment ──────────────────────────────────────────────────────
function assessLength(wordCount: number): { ok: boolean; message: string } {
  if (wordCount < 200) return { ok: false, message: "CV appears very short. Aim for 400–700 words for a graduate CV." };
  if (wordCount > 1200) return { ok: false, message: "CV may be too long. Graduate CVs should be 1–2 pages (400–700 words)." };
  return { ok: true, message: "CV length is appropriate for a graduate application." };
}

// ── Main analysis function ────────────────────────────────────────────────────
export interface CVAnalysisResult {
  biasPii: { type: string; value: string }[];          // must remove — bias risk
  contactIssues: { type: string; present: boolean; value?: string; advice: string }[]; // contact completeness
  scores: { ats: number; impact: number; structure: number; overall: number };
  matchedKeywords: string[];
  missingKeywords: string[];
  sections: Record<string, boolean>;
  strengths: string[];
  gaps: string[];
  sectionAdvice: Record<string, string>;
  projectsAdvice: {
    importance: "essential" | "highly recommended" | "useful";
    hasProjects: boolean;
    analysis: string;
    whatToHighlight: string[];
    exampleProjects: string[];
  };
  rewriteExample: { original: string; improved: string } | null;
  interviewQuestions: string[];
  interviewTips: string[];
  jobBoards: { name: string; url: string; description: string }[];
  atsTip: string;
  wordCount: number;
  roleFit: string;
  sector: string;
}

export function analyseCV(cvText: string, roleInput: string): CVAnalysisResult {
  const sector = normaliseSector(roleInput);
  const sectorData = SECTOR_DATABASE[sector];
  const tokens = tokenise(cvText);
  const bigrams = buildBigrams(tokens);
  const allTokens = [...tokens, ...bigrams];
  const wordCount = tokens.length;

  // ── Bias PII detection (flag for removal) ──
  const biasPii: { type: string; value: string }[] = [];
  const seenBiasTypes = new Set<string>();
  for (const { type, pattern } of BIAS_PII_PATTERNS) {
    const match = cvText.match(pattern);
    if (match && !seenBiasTypes.has(type)) {
      biasPii.push({ type, value: match[0].trim().slice(0, 50) });
      seenBiasTypes.add(type);
    }
  }

  // ── Contact completeness check (flag if ABSENT) ──
  const contactIssues: { type: string; present: boolean; value?: string; advice: string }[] = [];
  for (const { type, pattern, advice } of CONTACT_PATTERNS) {
    const match = cvText.match(pattern);
    contactIssues.push({
      type,
      present: !!match,
      value: match ? match[0].trim().slice(0, 60) : undefined,
      advice,
    });
  }

  // ── ATS keyword matching ──
  const allKeywords = sectorData.keywords;
  const matched = allKeywords.filter(kw => {
    const kwTokens = kw.toLowerCase().split(/\s+/);
    if (kwTokens.length === 1) return tokens.includes(kw.toLowerCase());
    const bigram = kwTokens.join(" ");
    return allTokens.includes(bigram);
  });
  const missing = allKeywords.filter(kw => !matched.includes(kw)).slice(0, 10);
  const atsScore = Math.min(100, Math.round((matched.length / Math.max(allKeywords.length, 1)) * 100));

  // ── Impact scoring ──
  const strongVerbCount = countStrongVerbs(tokens);
  const weakVerbCount = countWeakVerbs(cvText);
  const quantified = countQuantifiedBullets(cvText);
  const metricsPresent = hasMetrics(cvText);

  let impactScore = 40;
  impactScore += Math.min(30, strongVerbCount * 3);
  impactScore -= Math.min(20, weakVerbCount * 4);
  impactScore += Math.min(20, quantified * 4);
  if (metricsPresent) impactScore += 10;
  impactScore = Math.max(10, Math.min(100, Math.round(impactScore)));

  // ── Structure scoring ──
  const sections = detectSections(cvText);
  const lengthCheck = assessLength(wordCount);
  let structureScore = 0;
  if (sections.hasSummary)     structureScore += 15;
  if (sections.hasExperience)  structureScore += 25;
  if (sections.hasEducation)   structureScore += 25;
  if (sections.hasSkills)      structureScore += 20;
  if (sections.hasAchievements)structureScore += 10;
  if (sections.hasHobbies)     structureScore += 5;
  if (lengthCheck.ok)          structureScore += 10;
  structureScore = Math.min(100, Math.round(structureScore * (lengthCheck.ok ? 1 : 0.85)));

  // ── Overall score ──
  const overall = Math.round(atsScore * 0.4 + impactScore * 0.35 + structureScore * 0.25);

  // ── Projects analysis ──
  const projData = PROJECTS_ADVICE[sector];
  const projectsAdvice = {
    importance: projData.importance,
    hasProjects: sections.hasProjects,
    analysis: sections.hasProjects ? projData.ifPresent : projData.ifAbsent,
    whatToHighlight: projData.whatToHighlight,
    exampleProjects: projData.exampleProjects,
  };

  // ── Strengths ──
  const strengths: string[] = [];
  if (matched.length >= 5) strengths.push(`Strong keyword alignment — ${matched.length} sector-relevant terms found.`);
  if (strongVerbCount >= 5) strengths.push("Good use of action verbs — demonstrates active contribution throughout.");
  if (metricsPresent) strengths.push("Quantified achievements present — this significantly strengthens credibility with recruiters.");
  if (sections.hasExperience) strengths.push("Work experience section is present and structured.");
  if (sections.hasSkills) strengths.push("Dedicated skills section aids ATS scanning.");
  if (sections.hasSummary) strengths.push("Personal statement included — sets a strong opening tone.");
  if (sections.hasProjects) strengths.push("Projects section present — this is highly valued for graduate and entry-level applications.");
  if (contactIssues.every(c => c.present)) strengths.push("All key contact details (email, phone, LinkedIn) are present.");
  if (strengths.length === 0) strengths.push("CV has a clear overall structure to build upon.");

  // ── Gaps ──
  const gaps: string[] = [];
  if (missing.length > 5) gaps.push(`Missing ${missing.length} high-priority keywords for ${roleInput} roles.`);
  if (!metricsPresent) gaps.push("No quantified achievements — add numbers, percentages or scale to show the impact of your work.");
  if (weakVerbCount > 3) gaps.push(`Overuse of passive language ('helped', 'assisted', 'responsible for') — replace with direct action verbs.`);
  if (!sections.hasSummary) gaps.push("No personal statement — a two-to-three sentence targeted summary at the top of the CV significantly aids ATS and first impression.");
  if (!sections.hasSkills) gaps.push("No dedicated skills section — essential for ATS keyword matching in most graduate roles.");
  if (!sections.hasProjects && projData.importance === "essential") gaps.push(`No projects section — this is considered ${projData.importance} for ${roleInput} roles at graduate level.`);
  if (!lengthCheck.ok) gaps.push(lengthCheck.message);
  if (biasPii.length > 0) gaps.push(`${biasPii.length} item${biasPii.length > 1 ? "s" : ""} of potentially biasing personal information detected — review the privacy panel.`);
  const missingContacts = contactIssues.filter(c => !c.present);
  if (missingContacts.length > 0) gaps.push(`Missing contact detail${missingContacts.length > 1 ? "s" : ""}: ${missingContacts.map(c => c.type).join(", ")} — recruiters need these to reach you.`);

  // ── Section advice ──
  const sectionAdvice: Record<string, string> = {
    "Personal statement": sections.hasSummary
      ? `Your personal statement is present. Ensure it directly names the role (${roleInput}) and sector. Keep it to two or three sentences: who you are, what you bring, and what you are seeking. Avoid generic phrases such as 'hardworking team player'.`
      : `You are missing a personal statement. Add two to three sentences at the top of your CV that specifically reference ${roleInput} and your strongest qualification or experience. This is the first thing recruiters and ATS systems read.`,
    "Work experience": sections.hasExperience
      ? `Your experience section is present. Ensure every bullet point begins with a strong action verb and includes a measurable result. Replace any instance of 'responsible for' or 'helped with' with a direct verb. Add figures where possible — team size, project value, time saved.`
      : `No work experience section detected. Even part-time, voluntary or university project experience is relevant. Structure each entry with organisation, dates, role title, and three to four bullet points using the STAR method.`,
    "Education": sections.hasEducation
      ? `Education section detected. For graduate applications, include your degree classification (or predicted grade), A-level results, and any relevant modules. If your degree result is strong, place education near the top.`
      : `Education section appears to be missing or not clearly labelled. Include your degree title, university name, classification, and graduation year. Add three to four relevant modules if your work experience is limited.`,
    "Skills": sections.hasSkills
      ? `Skills section present. Ensure you list the specific tools, platforms and technical skills relevant to ${roleInput}. The following are particularly valuable for this role: ${missing.slice(0, 4).join(", ") || "sector-relevant tools"}.`
      : `No skills section found. Add a clearly labelled skills section listing technical tools, software, languages or methodologies relevant to ${roleInput}. This is critical for ATS matching.`,
  };

  // ── Employment gap (only added when detected) ──
  if (detectEmploymentGap(cvText)) {
    sectionAdvice["Employment gap"] = "A potential gap in your CV timeline was detected. Gaps are common and not automatically disqualifying — but unexplained gaps attract recruiter questions. Address gaps proactively: if the period involved caring responsibilities, illness, personal development, freelance work, or voluntary activity, include a brief entry in your experience section. For example: 'Career break — caring responsibilities (2023–2024)' or 'Independent study — [subject], self-directed (2022–2023)'. The Civil Service and NHS both have explicit guidance stating that gaps must not be penalised without explanation. If a gap involved mental health, you are under no obligation to disclose the reason — 'personal reasons' is a complete and acceptable answer.";
  }

  // ── Rewrite example ──
  const lines = cvText.split(/[\n\r]/).map(l => l.trim()).filter(l => l.length > 30 && l.length < 200);
  const weakLine = lines.find(l => {
    const lower = l.toLowerCase();
    return WEAK_VERBS.has(lower.split(/\s+/)[0]) ||
      /responsible for|helped|assisted|worked on|was involved/.test(lower);
  });

  let rewriteExample: { original: string; improved: string } | null = null;
  if (weakLine) {
    const improved = weakLine
      .replace(/^(Responsible for|Helped|Assisted|Worked on|Was involved in)\s*/i, "")
      .replace(/^./, c => "Led " + c.toLowerCase());
    rewriteExample = {
      original: weakLine,
      improved: improved + (!/\d/.test(improved) ? " — resulting in measurable improvement (add specific metric here)" : ""),
    };
  }

  // ── ATS tip ──
  const atsTip = atsScore < 50
    ? `Only ${matched.length} of ${allKeywords.length} target keywords found. Incorporate the missing terms naturally into your experience bullets and skills section. Do not list them without context.`
    : `Good keyword coverage. Ensure keywords appear in context (within experience descriptions), not just in a standalone list — this carries more weight in modern ATS systems.`;

  // ── Role fit ──
  const roleFit = overall >= 70
    ? `Your CV demonstrates reasonable alignment with ${roleInput} roles. Focus on the gaps below to move from good to strong.`
    : overall >= 45
    ? `Your CV has a foundation for ${roleInput} applications but requires targeted work on keyword coverage and impact language before submitting.`
    : `Your CV currently has limited alignment with ${roleInput} requirements. The recommendations below, if addressed, will significantly improve your chances.`;

  return {
    biasPii,
    contactIssues,
    scores: { ats: atsScore, impact: impactScore, structure: structureScore, overall },
    matchedKeywords: matched.slice(0, 15),
    missingKeywords: missing,
    sections,
    strengths: strengths.slice(0, 5),
    gaps: gaps.slice(0, 6),
    sectionAdvice,
    projectsAdvice,
    rewriteExample,
    interviewQuestions: sectorData.interviewQuestions,
    interviewTips: sectorData.interviewTips,
    jobBoards: sectorData.jobBoards,
    atsTip,
    wordCount,
    roleFit,
    sector,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Job Description Comparison Engine
// Extracts terms from a real job posting and compares word-for-word against CV
// ─────────────────────────────────────────────────────────────────────────────

// Common English stop words to exclude from JD keyword extraction
const STOP_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with","by",
  "from","as","is","was","are","were","be","been","being","have","has","had",
  "do","does","did","will","would","could","should","may","might","shall",
  "not","no","nor","so","yet","both","either","neither","each","few","more",
  "most","other","some","such","than","then","that","this","these","those",
  "we","you","he","she","it","they","our","your","their","its","us","them",
  "who","which","what","where","when","how","all","any","both","each","every",
  "if","while","about","against","between","into","through","during","before",
  "after","above","below","up","down","out","off","over","under","again",
  "further","once","here","there","why","because","since","although","though",
  "until","unless","whether","however","therefore","furthermore","moreover",
  "including","following","across","behind","beyond","plus","except","within",
  "without","along","toward","among","upon","also","can","just","too","very",
  "well","new","good","great","strong","key","high","highly","work","working",
  "role","position","team","company","organisation","opportunity","ability",
  "experience","candidate","applicant","application","apply","required","preferred",
  "responsible","responsibilities","duties","tasks","ensure","support","provide",
  "develop","manage","maintain","deliver","contribute","collaborate","communicate",
]);

export interface JDTerm {
  term: string;
  inCV: boolean;
  frequency: number;         // how often it appears in the JD
  isPhrase: boolean;         // true = multi-word phrase
  importance: "critical" | "important" | "useful";
}

export interface JDComparisonResult {
  matchScore: number;             // 0–100
  totalJDTerms: number;
  matchedCount: number;
  missingCount: number;
  terms: JDTerm[];               // all extracted terms, sorted by importance + frequency
  topMissing: JDTerm[];          // top 10 missing terms by importance
  topMatched: JDTerm[];          // terms present in both
  tailoringAdvice: string[];     // specific actionable advice
}

// Phrases that always indicate high importance in JDs
const IMPORTANCE_SIGNALS = {
  critical: [
    /\bessential\b/i, /\brequired\b/i, /\bmust have\b/i, /\bmust be\b/i,
    /\bnecessary\b/i, /\bfundamental\b/i, /\bcritical\b/i, /\bmandatory\b/i,
  ],
  important: [
    /\bdesirable\b/i, /\bpreferred\b/i, /\bideally\b/i, /\badvantage\b/i,
    /\bbeneficial\b/i, /\bexpected\b/i, /\bsought\b/i, /\bvalued\b/i,
  ],
};

function extractJDTerms(jdText: string): Map<string, { freq: number; isPhrase: boolean }> {
  const lower = jdText.toLowerCase();
  const termMap = new Map<string, { freq: number; isPhrase: boolean }>();

  // Extract unigrams
  const tokens = lower
    .replace(/[^a-z0-9\s\+\#\.\/]/g, " ")
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOP_WORDS.has(t));

  for (const token of tokens) {
    const existing = termMap.get(token);
    if (existing) existing.freq++;
    else termMap.set(token, { freq: 1, isPhrase: false });
  }

  // Extract bigrams (two-word phrases) — these carry more weight
  const rawTokens = lower.replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(t => t.length > 1);
  for (let i = 0; i < rawTokens.length - 1; i++) {
    const a = rawTokens[i], b = rawTokens[i + 1];
    if (STOP_WORDS.has(a) || STOP_WORDS.has(b)) continue;
    if (a.length < 3 || b.length < 3) continue;
    const bigram = `${a} ${b}`;
    const existing = termMap.get(bigram);
    if (existing) existing.freq++;
    else termMap.set(bigram, { freq: 1, isPhrase: true });
  }

  // Extract trigrams for technical phrases
  for (let i = 0; i < rawTokens.length - 2; i++) {
    const a = rawTokens[i], b = rawTokens[i + 1], c = rawTokens[i + 2];
    if (STOP_WORDS.has(a) || STOP_WORDS.has(c)) continue;
    if (a.length < 3 || c.length < 3) continue;
    const trigram = `${a} ${b} ${c}`;
    const existing = termMap.get(trigram);
    if (existing) existing.freq++;
    else termMap.set(trigram, { freq: 1, isPhrase: true });
  }

  // Remove unigrams that are subsumed by higher-frequency phrases
  for (const [term] of termMap) {
    if (term.includes(" ")) continue; // skip phrases themselves
    for (const [phrase, phraseData] of termMap) {
      if (!phrase.includes(" ")) continue;
      if (phrase.includes(term) && phraseData.freq >= termMap.get(term)!.freq) {
        termMap.delete(term);
        break;
      }
    }
  }

  return termMap;
}

function assignImportance(
  term: string,
  jdText: string,
  freq: number
): "critical" | "important" | "useful" {
  // Check surrounding context for importance signals
  const lower = jdText.toLowerCase();
  const idx = lower.indexOf(term.toLowerCase());
  if (idx === -1) return freq >= 3 ? "important" : "useful";

  // Look at the sentence containing this term
  const sentenceStart = Math.max(0, lower.lastIndexOf("\n", idx));
  const sentenceEnd = Math.min(lower.length, lower.indexOf("\n", idx) === -1 ? lower.length : lower.indexOf("\n", idx) + 100);
  const context = lower.slice(sentenceStart, sentenceEnd);

  for (const pattern of IMPORTANCE_SIGNALS.critical) {
    if (pattern.test(context)) return "critical";
  }
  for (const pattern of IMPORTANCE_SIGNALS.important) {
    if (pattern.test(context)) return "important";
  }

  return freq >= 3 ? "important" : "useful";
}

export function compareWithJobDescription(
  cvText: string,
  jdText: string
): JDComparisonResult {
  const cvLower = cvText.toLowerCase();
  const termMap = extractJDTerms(jdText);

  // Score each term: is it in the CV?
  const terms: JDTerm[] = [];

  for (const [term, { freq, isPhrase }] of termMap) {
    if (freq < 1) continue; // skip hapax if we want
    const inCV = cvLower.includes(term.toLowerCase());
    const importance = assignImportance(term, jdText, freq);

    terms.push({ term, inCV, frequency: freq, isPhrase, importance });
  }

  // Sort: importance desc, then frequency desc, then phrase-first
  terms.sort((a, b) => {
    const impOrder = { critical: 0, important: 1, useful: 2 };
    if (impOrder[a.importance] !== impOrder[b.importance])
      return impOrder[a.importance] - impOrder[b.importance];
    if (a.isPhrase !== b.isPhrase) return a.isPhrase ? -1 : 1;
    return b.frequency - a.frequency;
  });

  const matched = terms.filter(t => t.inCV);
  const missing = terms.filter(t => !t.inCV);

  // Weight score by importance
  const totalWeight = terms.reduce((acc, t) => {
    return acc + (t.importance === "critical" ? 3 : t.importance === "important" ? 2 : 1);
  }, 0);
  const matchWeight = matched.reduce((acc, t) => {
    return acc + (t.importance === "critical" ? 3 : t.importance === "important" ? 2 : 1);
  }, 0);

  const matchScore = totalWeight > 0 ? Math.round((matchWeight / totalWeight) * 100) : 0;

  // Tailoring advice — specific, not generic
  const tailoringAdvice: string[] = [];

  const criticalMissing = missing.filter(t => t.importance === "critical");
  if (criticalMissing.length > 0) {
    tailoringAdvice.push(
      `${criticalMissing.length} term${criticalMissing.length > 1 ? "s" : ""} marked as essential in this job description are absent from your CV: ${criticalMissing.slice(0, 4).map(t => `"${t.term}"`).join(", ")}. These must be incorporated before applying.`
    );
  }

  const phraseMissing = missing.filter(t => t.isPhrase && t.importance !== "useful").slice(0, 3);
  if (phraseMissing.length > 0) {
    tailoringAdvice.push(
      `Multi-word phrases carry extra ATS weight. Add these specific phrases from the job description into your experience bullets: ${phraseMissing.map(t => `"${t.term}"`).join(", ")}.`
    );
  }

  const highFreqMissing = missing.filter(t => t.frequency >= 3).slice(0, 3);
  if (highFreqMissing.length > 0) {
    tailoringAdvice.push(
      `The employer repeats these terms ${highFreqMissing[0]?.frequency || 3}+ times, signalling high priority: ${highFreqMissing.map(t => `"${t.term}"`).join(", ")}. Repetition in a JD indicates core requirements.`
    );
  }

  if (matchScore >= 70) {
    tailoringAdvice.push("Strong keyword alignment with this job description. Ensure matching terms appear in context within your experience section, not only in a skills list.");
  } else if (matchScore >= 45) {
    tailoringAdvice.push("Moderate alignment. Prioritise adding the critical and important missing terms before submitting. Use the exact phrasing from the job description where natural.");
  } else {
    tailoringAdvice.push("Low alignment with this specific posting. Consider whether your experience genuinely matches this role, or if significant CV tailoring is needed. Review the job description requirements against your background carefully.");
  }

  return {
    matchScore,
    totalJDTerms: terms.length,
    matchedCount: matched.length,
    missingCount: missing.length,
    terms: terms.slice(0, 60),         // top 60 for display
    topMissing: missing.slice(0, 15),
    topMatched: matched.slice(0, 15),
    tailoringAdvice,
  };
}
