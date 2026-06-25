import { Article, Author } from '../types';

// Mock authors
const authors: Author[] = [
  {
    id: '1',
    name: 'Jane Smith',
    email: 'jane@example.com',
    bio: 'Senior tech journalist with 10+ years of experience covering Silicon Valley and global tech trends.',
    avatarUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg'
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'john@example.com',
    bio: 'Political analyst specializing in international relations and global economics.',
    avatarUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'
  },
  {
    id: '3',
    name: 'Emily Chen',
    email: 'emily@example.com',
    bio: 'Full-stack developer and technical writer covering the latest in programming and technology.',
    avatarUrl: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg'
  },
  {
    id: '4',
    name: 'Michael Rodriguez',
    email: 'michael@example.com',
    bio: 'Gaming industry insider and reviewer with a passion for both indie and AAA titles.',
    avatarUrl: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg'
  }
];

// Helper function to create dates in the past
const daysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

// Mock articles
const articles: Article[] = [
  {
    id: '1',
    slug: 'future-of-ai-technology',
    title: 'The Future of AI: How Machine Learning is Transforming Industries',
    subtitle: 'A deep dive into the most significant AI developments of 2025',
    content: `<p>Artificial Intelligence continues to evolve at an unprecedented pace. In 2025, we're seeing AI applications that were considered science fiction just a few years ago.</p>
              <h2>Breakthrough Applications</h2>
              <p>Perhaps the most significant breakthrough has been in healthcare, where AI-driven diagnostic tools are now achieving accuracy rates that surpass human specialists in several fields. These systems are not replacing doctors but rather augmenting their capabilities and helping to address critical healthcare shortages in underserved regions.</p>
              <p>In manufacturing, adaptive AI systems are revolutionizing production lines, with fully autonomous factories becoming increasingly common. These smart factories can reconfigure themselves based on demand patterns, supply chain disruptions, or even changing consumer preferences.</p>
              <h2>Ethical Considerations</h2>
              <p>However, these advances come with significant ethical challenges. The AI bias problem remains partially unsolved, with researchers and policymakers working to establish robust frameworks for evaluating AI fairness and accountability.</p>
              <p>Privacy concerns have also intensified as AI systems require vast amounts of data to function effectively. New legislation is being introduced globally to address these issues, but technology is often outpacing regulatory frameworks.</p>
              <h2>Looking Forward</h2>
              <p>As we move into the second half of the decade, the next frontier appears to be general AI systems that can transfer learning across domains - a capability that would represent a quantum leap from today's specialized systems.</p>
              <p>One thing is certain: the AI revolution is just beginning, and its impact on society, economics, and our daily lives will continue to expand in ways we are only beginning to understand.</p>`,
    excerpt: 'Exploring how AI and machine learning are revolutionizing industries in 2025, from healthcare diagnostics to autonomous manufacturing and beyond.',
    imageUrl: 'https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg',
    category: 'tech',
    tags: ['AI', 'Machine Learning', 'Technology', 'Innovation'],
    author: authors[0],
    publishedAt: daysAgo(2),
    updatedAt: daysAgo(2),
    featured: true,
    isDraft: false
  },
  {
    id: '2',
    slug: 'global-diplomacy-shifts',
    title: 'Shifting Alliances: The New Landscape of Global Diplomacy',
    subtitle: 'How resource competition and climate change are redrawing international relationships',
    content: `<p>The geopolitical landscape of 2025 bears little resemblance to that of just five years ago. Traditional alliances have fractured while new coalitions have formed around shared interests that transcend historical relationships.</p>
              <h2>Resource Competition</h2>
              <p>At the center of many of these changes is the intensifying competition for critical resources. Rare earth elements, essential for advanced technologies and renewable energy systems, have become the new oil - strategically vital and increasingly contentious.</p>
              <p>Nations with abundant supplies of these resources, particularly in Africa and South America, have gained significant geopolitical leverage, while traditional powers scramble to secure reliable supply chains through a combination of diplomacy, investment, and occasionally more aggressive means.</p>
              <h2>Climate Diplomacy</h2>
              <p>Climate change has emerged as perhaps the most transformative force in international relations. The formation of the Climate Action Coalition (CAC), comprising over 40 nations committed to aggressive emissions reductions, has created a new power bloc that exerts influence through market access and technology sharing.</p>
              <p>Nations remaining outside this coalition increasingly face carbon border adjustments and other economic penalties, creating what some analysts have called a "green curtain" dividing the world economy.</p>
              <h2>Regional Realignments</h2>
              <p>Regional dynamics have also shifted dramatically. In Asia, the formation of the Pacific Prosperity Partnership, excluding both Chinese and American direct participation, signals a desire among middle powers to chart an independent course between the competing superpowers.</p>
              <p>In Europe, energy security concerns have led to surprising new partnerships with North African nations, centered around renewable energy projects in the Sahara that now supply significant portions of European electricity needs.</p>
              <p>As we move forward, the nations that thrive will likely be those most adept at navigating this complex new landscape, where traditional concepts of allies and adversaries have given way to a more fluid, issue-based approach to international relations.</p>`,
    excerpt: 'An analysis of how resource competition and climate change are reshaping global alliances and international relationships in unprecedented ways.',
    imageUrl: 'https://images.pexels.com/photos/1098769/pexels-photo-1098769.jpeg',
    category: 'geopolitics',
    tags: ['Diplomacy', 'International Relations', 'Climate', 'Resources'],
    author: authors[1],
    publishedAt: daysAgo(3),
    updatedAt: daysAgo(3),
    featured: true,
    isDraft: false
  },
  {
    id: '3',
    slug: 'web-development-trends-2025',
    title: 'Web Development in 2025: Trends Reshaping How We Build',
    subtitle: 'From AI-assisted coding to WebAssembly dominance',
    content: `<p>The landscape of web development continues to evolve at a breathtaking pace. As we move through 2025, several key trends are fundamentally changing how developers approach building for the web.</p>
              <h2>AI-Assisted Development</h2>
              <p>Perhaps the most significant shift has been the mainstream adoption of AI-assisted development tools. What began as simple code completion has evolved into sophisticated systems that can generate entire components or refactor complex code bases with minimal human guidance.</p>
              <p>These tools have dramatically increased developer productivity while simultaneously lowering the barrier to entry for newcomers to the field. Companies report development velocity increases of up to 60% for teams fully embracing these technologies.</p>
              <h2>WebAssembly Ecosystem</h2>
              <p>WebAssembly (Wasm) has finally fulfilled its promise of bringing near-native performance to web applications. With the Component Model now fully implemented across all major browsers, developers can seamlessly share Wasm modules written in different languages.</p>
              <p>This has led to a flourishing ecosystem of high-performance components, particularly in computationally intensive domains like image processing, 3D rendering, and data analysis. Languages previously uncommon in web development, such as Rust and C++, have seen significant adoption for performance-critical browser applications.</p>
              <h2>Edge-Native Development</h2>
              <p>The continued expansion of edge computing platforms has shifted development paradigms toward "edge-native" applications. These applications intelligently distribute computation between client devices, edge nodes, and traditional cloud infrastructure.</p>
              <p>This approach has dramatically reduced latency for users worldwide while often reducing infrastructure costs. Frameworks specifically designed for edge-native development have proliferated, making it increasingly straightforward to build globally distributed applications.</p>
              <h2>Micro-Frontends at Scale</h2>
              <p>Micro-frontend architectures have matured significantly, with standardized approaches emerging for effectively splitting large applications into independently deployable units. This has been particularly valuable for large organizations maintaining complex web applications.</p>
              <p>The real breakthrough has come in tooling that makes these architectures manageable at scale, with sophisticated solutions for shared state management, consistent styling, and performance monitoring across micro-frontend boundaries.</p>
              <p>As these trends continue to evolve, the web platform itself is cementing its position as the most versatile and accessible application runtime ever created, capable of delivering experiences that rival or exceed what was previously possible only in native applications.</p>`,
    excerpt: 'An overview of the dominant web development trends of 2025, including AI-assisted coding, WebAssembly ecosystem, and edge-native application architectures.',
    imageUrl: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg',
    category: 'programming',
    tags: ['Web Development', 'JavaScript', 'WebAssembly', 'Edge Computing'],
    author: authors[2],
    publishedAt: daysAgo(5),
    updatedAt: daysAgo(4),
    featured: true,
    isDraft: false
  },
  {
    id: '4',
    slug: 'next-gen-console-review',
    title: 'Next-Gen Console Showdown: Performance, Games, and Ecosystem',
    subtitle: 'A comprehensive comparison of the latest gaming hardware',
    content: `<p>The latest generation of gaming consoles has now been in the market long enough for us to make definitive judgments about their relative strengths and weaknesses. This comprehensive analysis looks at performance metrics, game libraries, and overall ecosystems.</p>
              <h2>Hardware Performance</h2>
              <p>Raw performance numbers only tell part of the story, but they're worth examining. The NextBox Series X continues to hold a slight edge in terms of pure GPU compute performance, while the PlayStation 6 leverages its custom I/O architecture to deliver faster loading times in many scenarios.</p>
              <p>The real differentiator has proven to be each system's implementation of ray tracing technology. NextBox titles consistently show more advanced lighting effects, while PS6 games often prioritize maintaining higher framerates with somewhat simplified ray tracing implementations.</p>
              <h2>Game Libraries</h2>
              <p>Sony's first-party studios continue to deliver critically acclaimed exclusive titles that showcase the hardware's capabilities. The recently released "Horizon: New Dawn" sets new benchmarks for visual fidelity and world design.</p>
              <p>Microsoft has narrowed the exclusive game gap significantly with its aggressive studio acquisition strategy paying dividends. The latest entries in the Elder Scrolls and Fallout franchises as console exclusives have been particularly impactful for the platform.</p>
              <p>Cross-platform titles perform admirably on both systems, with differences that would be difficult to discern without side-by-side comparisons.</p>
              <h2>Services and Ecosystem</h2>
              <p>Game Pass remains Microsoft's secret weapon, offering an unmatched value proposition that continues to grow in importance as game prices have increased. The recent addition of day-one third-party AAA titles has further strengthened this advantage.</p>
              <p>Sony's revamped PlayStation Plus service has improved substantially but still doesn't quite match the value proposition of Game Pass. However, Sony's PS VR2 platform offers a premium VR experience that has no equivalent in the Xbox ecosystem.</p>
              <h2>The Verdict</h2>
              <p>Both consoles represent excellent gaming platforms with different strengths. The PS6 excels with its exceptional first-party titles and VR capabilities, while the NextBox Series X offers slightly better performance for third-party games and the unbeatable value of Game Pass.</p>
              <p>The ideal scenario for dedicated gamers remains owning both systems, but if forced to choose one, the decision largely comes down to whether specific exclusive games or features (like VR or Game Pass) align with your personal preferences.</p>`,
    excerpt: 'A detailed comparison of the latest gaming consoles, examining performance metrics, exclusive games, subscription services, and overall value propositions.',
    imageUrl: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg',
    category: 'games',
    tags: ['Gaming', 'Consoles', 'PlayStation', 'Xbox'],
    author: authors[3],
    publishedAt: daysAgo(7),
    updatedAt: daysAgo(7),
    featured: true,
    isDraft: false
  },
  {
    id: '5',
    slug: 'quantum-computing-breakthrough',
    title: 'Quantum Computing Breakthrough Promises to Revolutionize Cryptography',
    subtitle: 'Researchers achieve quantum supremacy in factoring large prime numbers',
    content: `<p>A team of researchers at the Quantum Computing Institute has announced a significant breakthrough in quantum algorithms that could have far-reaching implications for cybersecurity and cryptography.</p>
              <h2>The Breakthrough</h2>
              <p>The team has successfully demonstrated a quantum algorithm capable of factoring 4096-bit RSA keys in under 24 hours using their 500-qubit quantum computer. This achievement represents a significant advancement over previous capabilities and brings quantum computers dangerously close to being able to break commonly used encryption methods.</p>
              <p>"This is both exciting and concerning," said Dr. Amara Chen, lead researcher on the project. "It demonstrates the extraordinary potential of quantum computing, but also underscores the urgent need to transition to quantum-resistant encryption methods."</p>
              <h2>Implications for Cybersecurity</h2>
              <p>The breakthrough has sent shockwaves through the cybersecurity community, despite years of warnings about this eventuality. Many government agencies and corporations are still using encryption standards vulnerable to quantum attacks.</p>
              <p>The National Institute of Standards and Technology (NIST) has been working on post-quantum cryptography standards, but widespread implementation remains incomplete. This breakthrough may accelerate adoption timelines considerably.</p>
              <h2>Beyond Cryptography</h2>
              <p>While the implications for security are grabbing headlines, the research team emphasized that the same algorithmic advances could be applied to solve complex problems in materials science, drug discovery, and climate modeling.</p>
              <p>"The techniques we developed to achieve this result have applications far beyond cryptanalysis," explained team member Dr. Marcus Williams. "We're particularly excited about applications in simulating molecular interactions for new pharmaceutical compounds."</p>
              <p>As quantum computing continues to advance, we're entering an era where problems previously considered computationally intractable are becoming solvable, with profound implications across numerous fields of science and technology.</p>`,
    excerpt: 'Scientists have achieved a quantum computing milestone that threatens current encryption standards while opening new possibilities for scientific discovery.',
    imageUrl: 'https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg',
    category: 'tech',
    tags: ['Quantum Computing', 'Cybersecurity', 'Encryption', 'Research'],
    author: authors[0],
    publishedAt: daysAgo(10),
    updatedAt: daysAgo(9),
    featured: false,
    isDraft: false
  },
  {
    id: '6',
    slug: 'climate-adaptation-strategies',
    title: 'Climate Adaptation Strategies Reshaping Global Agriculture',
    subtitle: 'How farmers worldwide are innovating in response to changing climate patterns',
    content: `<p>As climate change continues to alter growing conditions around the world, agricultural communities are developing innovative adaptation strategies that could provide a roadmap for global food security in the coming decades.</p>
              <h2>Technological Solutions</h2>
              <p>Precision agriculture technologies have been at the forefront of adaptation efforts in developed regions. Advanced sensor networks combined with AI-driven analytics are enabling farmers to optimize irrigation, reduce fertilizer usage, and select crop varieties suited to emerging conditions.</p>
              <p>In California's drought-stricken Central Valley, for example, sensor-based irrigation systems have reduced water usage by up to 40% while maintaining or improving yields through targeted application methods.</p>
              <h2>Traditional Knowledge Resurgence</h2>
              <p>Perhaps more surprising has been the resurgence of traditional and indigenous agricultural practices that have proven remarkably well-suited to changing conditions. In the Andean highlands, farmers are returning to ancient terrace farming techniques and diverse crop polycultures that show remarkable resilience to irregular rainfall patterns.</p>
              <p>Similar movements are emerging across Africa, where traditional drought-resistant crops like millet and sorghum are being reintegrated into farming systems previously dominated by more commercial but climate-vulnerable varieties.</p>
              <h2>Policy Innovations</h2>
              <p>Forward-thinking policy frameworks are proving crucial in supporting agricultural transitions. The Agricultural Resilience Act in New Zealand has pioneered an approach that compensates farmers not just for production but for ecosystem services like carbon sequestration, water management, and biodiversity maintenance.</p>
              <p>This model, now being adapted by several other nations, creates economic incentives for practices that build resilience while addressing multiple environmental challenges simultaneously.</p>
              <h2>Collaborative Approaches</h2>
              <p>Perhaps the most encouraging development has been the emergence of farmer-to-farmer networks that rapidly share adaptation strategies across regions with similar challenges. The Climate-Smart Agriculture Alliance now connects over two million farmers across 40 countries, creating an unprecedented knowledge-sharing platform.</p>
              <p>These networks are emerging as powerful innovation accelerators, allowing successful practices to spread rapidly without waiting for formal research and extension processes.</p>
              <p>While significant challenges remain, these multifaceted adaptation efforts offer reasons for cautious optimism about our ability to maintain food production in the face of climate disruption, particularly if they continue to receive adequate support and investment.</p>`,
    excerpt: 'An exploration of how farmers around the world are adapting to climate change through a combination of advanced technology, traditional practices, and innovative policies.',
    imageUrl: 'https://images.pexels.com/photos/440731/pexels-photo-440731.jpeg',
    category: 'global-market',
    tags: ['Agriculture', 'Climate Change', 'Sustainability', 'Food Security'],
    author: authors[1],
    publishedAt: daysAgo(12),
    updatedAt: daysAgo(12),
    featured: false,
    isDraft: false
  },
  {
    id: '7',
    slug: 'microservices-to-monolith',
    title: 'The Great Reversal: Why Companies Are Moving Back from Microservices to Monoliths',
    subtitle: 'Learning from the microservices experiment',
    content: `<p>In a surprising trend reversal, a growing number of technology companies are abandoning complex microservices architectures in favor of a return to monolithic applications. This shift is prompting a reassessment of software architecture best practices across the industry.</p>
              <h2>The Microservices Promise</h2>
              <p>Over the past decade, microservices architecture was widely adopted based on promises of improved scalability, development velocity, and system resilience. By breaking applications into small, independently deployable services, organizations hoped to enable parallel development and targeted scaling.</p>
              <p>Major tech companies like Netflix, Amazon, and Uber became prominent advocates, documenting their journeys and spawning countless imitators eager to achieve similar benefits.</p>
              <h2>The Reality Check</h2>
              <p>However, many organizations have found that microservices introduced levels of complexity that outweighed their benefits, particularly for applications with moderate scaling requirements.</p>
              <p>"We spent more time managing the interactions between services than adding features," explained Sarah Chen, CTO of a mid-sized financial technology company that recently completed a migration back to a monolithic architecture. "Our developer productivity has nearly doubled since the transition."</p>
              <h2>The New Monoliths</h2>
              <p>Importantly, the monoliths companies are returning to are not identical to those of a decade ago. Modern "modular monoliths" incorporate many lessons learned from the microservices era, with clear internal boundaries, well-defined interfaces between components, and improved deployment pipelines.</p>
              <p>These applications maintain many of the architectural benefits of microservices while eliminating the operational complexity of distributed systems, cross-service debugging challenges, and the dreaded "distributed monolith" anti-pattern that many microservice implementations evolved into.</p>
              <h2>Finding the Right Balance</h2>
              <p>The pendulum isn't swinging completely back, however. Organizations with genuine hyperscale requirements continue to find value in microservices approaches, and certain domains with clear boundaries remain good candidates for service separation.</p>
              <p>"It's not about monoliths versus microservices anymore," noted Dr. Thomas Weigel, software architecture researcher. "It's about finding the right level of coupling and cohesion for your specific context and constraints."</p>
              <p>This more nuanced perspective represents a maturation of the industry's approach to architecture, moving beyond dogmatic adherence to any single paradigm and toward more context-sensitive decision-making.</p>`,
    excerpt: 'Analyzing why many companies are abandoning microservices architectures in favor of modern, modular monoliths after experiencing the hidden costs and complexity of highly distributed systems.',
    imageUrl: 'https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg',
    category: 'programming',
    tags: ['Software Architecture', 'Microservices', 'Development', 'Engineering'],
    author: authors[2],
    publishedAt: daysAgo(15),
    updatedAt: daysAgo(14),
    featured: false,
    isDraft: false
  },
  {
    id: '8',
    slug: 'indie-game-success-story',
    title: 'From Bedroom to Bestseller: The Indie Game Success Story of 2025',
    subtitle: 'How a three-person team created the year\'s most innovative game',
    content: `<p>In an industry increasingly dominated by massive AAA productions with nine-figure budgets, the breakthrough success of "Ephemeral" stands as a remarkable testament to the continued vitality of indie game development.</p>
              <h2>An Unlikely Beginning</h2>
              <p>Created by just three developers working remotely across different continents, "Ephemeral" began as a game jam project that explored an unusual premise: a world where player actions permanently alter the game environment not just for themselves, but for all future players.</p>
              <p>"We never set out to create a commercial hit," explained lead developer Maya Kowalski. "We were exploring an idea that fascinated us personally - how players might behave if they knew their actions would affect the experience of every player who came after them."</p>
              <h2>A Revolutionary Mechanic</h2>
              <p>The game's central innovation is its "persistent ecosystem" - a procedurally generated world that evolves not through pre-programmed routines but in response to the collective decisions of the player community.</p>
              <p>When players choose to preserve natural resources, subsequent players find a flourishing environment with abundant wildlife and lush landscapes. Exploitative approaches yield immediate rewards but degrade the environment for future players, creating a fascinating social experiment alongside the core exploration gameplay.</p>
              <h2>Viral Community Growth</h2>
              <p>What began with a modest launch on Steam quickly gained traction as players began sharing their experiences on social platforms. The realization that every playthrough was uniquely shaped by the community's prior choices sparked intense discussion and documentation efforts.</p>
              <p>The game's Discord server grew from a few hundred members to over three million in just two months, with players creating elaborate maps, guides, and even philosophical manifestos about the optimal balance between individual gain and collective stewardship.</p>
              <h2>Industry Impact</h2>
              <p>The commercial success of "Ephemeral" - now having sold over five million copies without discounting - has sent ripples through the industry. Major publishers are reportedly reassessing their approaches to player communities and environmental storytelling.</p>
              <p>More importantly, it has inspired a new wave of indie developers exploring innovative mechanics that could only emerge from small, experimental teams willing to take creative risks.</p>
              <p>"The success of 'Ephemeral' reminds us that gaming's most interesting innovations often come from its fringes," noted veteran game designer and critic Hideo Martinez. "It proves there's still room for small teams to change how we think about what games can be."</p>`,
    excerpt: 'The story behind "Ephemeral," a revolutionary indie game created by three developers that has taken the gaming world by storm with its innovative community-driven evolution mechanics.',
    imageUrl: 'https://images.pexels.com/photos/275033/pexels-photo-275033.jpeg',
    category: 'games',
    tags: ['Indie Games', 'Game Design', 'Success Stories', 'Innovation'],
    author: authors[3],
    publishedAt: daysAgo(18),
    updatedAt: daysAgo(17),
    featured: false,
    isDraft: false
  },
  {
    id: '9',
    slug: 'neuromorphic-computing-advancements',
    title: 'Neuromorphic Computing Breakthroughs Promise More Efficient AI',
    subtitle: 'New chip designs mimic the brain\'s architecture for dramatic efficiency gains',
    content: `<p>Recent advances in neuromorphic computing are promising to dramatically reduce the energy requirements for artificial intelligence systems while potentially offering new capabilities that conventional computing architectures struggle to deliver.</p>
              <h2>The Efficiency Challenge</h2>
              <p>As AI systems have grown more capable, they've also become extraordinarily resource-intensive. Training modern large language models can consume millions of dollars worth of computing resources and enough electricity to power a small town for months.</p>
              <p>Even deploying these models requires substantial computational resources, limiting their use in edge devices and raising concerns about AI's growing environmental footprint.</p>
              <h2>Mimicking Biology</h2>
              <p>Neuromorphic computing tackles this challenge by taking inspiration from the brain's architecture - still by far the most efficient intelligent system known. Unlike conventional computers that separate memory and processing, neuromorphic systems integrate the two, much like biological neurons.</p>
              <p>The most recent breakthrough comes from NeuraTech's Synapse-3 chip, which demonstrates a 200x improvement in energy efficiency compared to GPU-based systems when running certain neural network workloads.</p>
              <p>"The human brain performs incredible feats of perception and cognition while consuming roughly the same power as a light bulb," explained Dr. Eleanor Hughes, NeuraTech's research director. "We're still far from that efficiency, but we're making rapid progress by learning from biology."</p>
              <h2>Beyond Efficiency</h2>
              <p>Perhaps more intriguing are the capabilities unique to neuromorphic architectures. The Synapse-3's spiking neural networks excel at processing temporal data and can directly incorporate sensor inputs without the extensive preprocessing required by conventional deep learning systems.</p>
              <p>This makes them particularly well-suited for applications like real-time robotics, autonomous vehicles, and sensory augmentation systems where continuous adaptation to streaming data is essential.</p>
              <h2>Commercial Applications</h2>
              <p>While still in early stages, neuromorphic computing is beginning to find commercial applications. Vision systems using the technology are being deployed in smart city infrastructure, offering 24/7 monitoring with power requirements low enough to operate entirely on solar power.</p>
              <p>Several smartphone manufacturers have announced plans to include neuromorphic co-processors in upcoming flagship devices, primarily to handle on-device AI workloads with minimal battery impact.</p>
              <p>As these systems continue to evolve, they may represent not just an optimization of existing AI approaches but a fundamentally different and complementary paradigm for machine intelligence - one that could eventually help address both the resource requirements and architectural limitations of current AI systems.</p>`,
    excerpt: 'An exploration of recent advances in neuromorphic computing that promise dramatic improvements in AI energy efficiency by mimicking the brain\'s neural architecture.',
    imageUrl: 'https://images.pexels.com/photos/325229/pexels-photo-325229.jpeg',
    category: 'tech',
    tags: ['Neuromorphic Computing', 'AI', 'Hardware', 'Innovation'],
    author: authors[0],
    publishedAt: daysAgo(20),
    updatedAt: daysAgo(20),
    featured: false,
    isDraft: false
  },
  {
    id: '10',
    slug: 'middle-power-diplomacy',
    title: 'The Rise of Middle Power Diplomacy in a Multipolar World',
    subtitle: 'How mid-sized nations are shaping global politics through strategic cooperation',
    content: `<p>In the increasingly multipolar global order, a new diplomatic force is emerging: coordinated blocs of middle powers that are reshaping international relations through strategic alignment on key issues despite geographic dispersion.</p>
              <h2>The New Alignments</h2>
              <p>The most prominent example is the M10, an informal but increasingly cohesive grouping that includes countries like Canada, Australia, South Korea, the Netherlands, and Singapore. Despite their geographic and cultural differences, these nations have identified shared interests in preserving rules-based international order, free trade, and digital governance.</p>
              <p>"What we're seeing is not traditional alliance formation, but a new kind of issue-based alignment," explained Dr. Sarah Mendelssohn, professor of international relations. "These countries recognize that while they can't match the major powers individually, their collective economic and diplomatic weight is substantial."</p>
              <h2>Diplomatic Innovation</h2>
              <p>The M10 and similar groupings have pioneered new approaches to diplomatic coordination. The Digital Governance Treaty, which established shared standards for data protection, algorithmic transparency, and cyber defense, began as an M10 initiative before expanding to include over 30 signatories.</p>
              <p>Similarly, the Climate Adaptation Fund, which pools resources for climate resilience projects in vulnerable regions, represents a middle-power solution to a global challenge that had become deadlocked in larger forums.</p>
              <h2>Balancing Between Giants</h2>
              <p>Perhaps most significantly, these middle power blocs are creating diplomatic space between the major powers of the United States and China. Rather than choosing sides in great power competition, they are establishing independent positions and, in some cases, mediating tensions.</p>
              <p>The Responsible AI Consortium, led by middle powers but eventually joined by both American and Chinese firms, demonstrates how these nations can create forums for cooperation even amid strategic rivalry.</p>
              <h2>Future Trajectories</h2>
              <p>While these middle power alignments remain less formal than traditional military alliances or regional groupings, they are nonetheless becoming institutionalized through regular ministerial meetings, joint diplomatic initiatives, and coordinated positions in international organizations.</p>
              <p>As traditional multilateral institutions struggle with gridlock and legitimacy challenges, these flexible coalitions of middle powers may increasingly become the most effective vehicles for addressing transnational challenges and maintaining international order.</p>
              <p>"The most interesting innovations in global governance are coming not from the great powers or established institutions, but from these adaptive networks of middle powers," observed former diplomat Carlos Gutierrez. "They may well represent the future of effective multilateralism."</p>`,
    excerpt: 'Examining how coalitions of middle powers are creating new forms of diplomatic influence in a multipolar world through strategic coordination on key global issues.',
    imageUrl: 'https://images.pexels.com/photos/64271/queen-of-liberty-statue-of-liberty-new-york-liberty-statue-64271.jpeg',
    category: 'geopolitics',
    tags: ['Diplomacy', 'International Relations', 'Middle Powers', 'Multilateralism'],
    author: authors[1],
    publishedAt: daysAgo(25),
    updatedAt: daysAgo(24),
    featured: false,
    isDraft: false
  },
  {
    id: '11',
    slug: 'rust-programming-enterprise-adoption',
    title: 'Rust\'s Enterprise Moment: How Safety-First Programming is Winning Over Corporations',
    subtitle: 'Major companies are increasingly adopting Rust for mission-critical systems',
    content: `<p>After years of growing popularity among developers, Rust is experiencing a breakthrough moment in enterprise adoption, with major corporations increasingly selecting the language for mission-critical systems where safety and reliability are paramount.</p>
              <h2>From Enthusiasts to Enterprise</h2>
              <p>Rust's journey from a Mozilla research project to enterprise mainstay reflects a growing recognition that memory safety issues remain the root cause of the majority of serious security vulnerabilities. While the language has been popular with systems programmers for years, recent high-profile security failures have accelerated adoption at the institutional level.</p>
              <p>"After dealing with four critical vulnerabilities in our payment processing infrastructure last year, all stemming from memory safety issues in our C++ codebase, we made the decision to transition to Rust for all new development," explained Jennifer Martinez, CTO of a Fortune 500 financial services company. "The cost of rewriting is significant, but far less than the operational and reputational damage from security breaches."</p>
              <h2>Industry Leaders Paving the Way</h2>
              <p>Several industry giants have made public commitments to Rust. Microsoft now uses Rust for components of Windows and Azure, Google has adopted it for portions of Android and Chrome, and Amazon's AWS has embraced the language for performance-critical infrastructure.</p>
              <p>Perhaps most significantly, the automotive industry has begun standardizing on Rust for new software-defined vehicle platforms, with the Automotive Grade Rust working group establishing certification standards for safety-critical automotive systems.</p>
              <h2>Ecosystem Maturation</h2>
              <p>The enterprise shift has been enabled by significant maturation in Rust's ecosystem. Enterprise-ready features like improved compilation times, better IDE integration, and more comprehensive documentation have addressed earlier adoption barriers.</p>
              <p>The availability of commercial support options has also expanded dramatically, with multiple consulting firms now offering enterprise transition services, training programs, and long-term support contracts.</p>
              <h2>Cultural Impact</h2>
              <p>Beyond the technical merits, Rust is influencing engineering culture within organizations that adopt it. The language's emphasis on explicit handling of complexity and potential failure modes often spreads to other aspects of system design.</p>
              <p>"We've seen that teams working in Rust tend to bring a more rigorous approach to architecture and design discussions even outside the codebase," noted Dr. Alain Monier, who studies software engineering practices. "There's a 'Rust mindset' that emphasizes making implicit constraints explicit, which benefits overall system quality."</p>
              <p>While Rust won't replace other languages entirely — many organizations are adopting it strategically for security-sensitive components while maintaining existing codebases in other languages — its influence on how enterprises approach software reliability appears to be growing well beyond the code actually written in it.</p>`,
    excerpt: 'An analysis of Rust programming language\'s accelerating adoption in enterprise environments, where its memory safety guarantees are proving critical for security-sensitive applications.',
    imageUrl: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg',
    category: 'programming',
    tags: ['Rust', 'Programming Languages', 'Enterprise Software', 'Security'],
    author: authors[2],
    publishedAt: daysAgo(28),
    updatedAt: daysAgo(28),
    featured: false,
    isDraft: false
  },
  {
    id: '12',
    slug: 'procedural-narrative-in-gaming',
    title: 'The Revolution in Procedural Narrative: AI Storytelling in Games',
    subtitle: 'How advanced AI is enabling truly dynamic and responsive game narratives',
    content: `<p>A quiet revolution is unfolding in video game storytelling, as advances in AI-powered procedural narrative systems are enabling experiences where stories adapt and evolve in response to player actions in increasingly sophisticated ways.</p>
              <h2>Beyond Branching Narratives</h2>
              <p>Traditional approaches to game storytelling have relied on pre-written branching narratives, where players might choose between a handful of developer-created paths. Modern procedural narrative systems are fundamentally different, generating story elements, character motivations, and plot developments dynamically.</p>
              <p>"We're moving from the 'choose your own adventure' model to something more akin to an improvisational storyteller that responds to the player's actions," explained Narrative AI researcher Dr. Maya Patel. "The game observes what interests individual players and crafts storylines around their unique patterns of engagement."</p>
              <h2>Technical Foundations</h2>
              <p>This evolution has been enabled by the convergence of several technologies. Large language models provide the foundation for generating natural-sounding dialogue and descriptions, while specialized planning systems manage narrative coherence across longer story arcs.</p>
              <p>Perhaps most crucially, sophisticated agent-based character models allow non-player characters to maintain consistent personalities and relationship dynamics while responding believably to changing circumstances.</p>
              <h2>Practical Applications</h2>
              <p>The indie RPG "Emergent Tales" has demonstrated the potential of these approaches, creating unique storylines for each player based on their in-game decisions, play style, and even the time they spend in different locations. The game features no main quest line in the traditional sense, instead weaving plot threads dynamically around character interactions.</p>
              <p>Meanwhile, larger studios are incorporating elements of procedural narrative into otherwise traditional games. "Destiny Chronicles" uses AI to generate personalized side quests that reflect each player's previous choices and combat preferences, seamlessly integrating them with the hand-crafted main campaign.</p>
              <h2>Creative Collaboration</h2>
              <p>Rather than replacing human writers, these systems are evolving into collaborative tools where writers define character backgrounds, world rules, and narrative possibilities that the AI then assembles and adapts based on player actions.</p>
              <p>"I don't write specific conversations anymore," noted Emma Chen, narrative director at Parallel Worlds Studios. "Instead, I create character guides that define a character's values, secrets, and emotional triggers. The system then generates dialogue that's consistent with those parameters while responding to the unique situation."</p>
              <p>While still evolving, these technologies promise a future where each player's experience can be uniquely tailored without requiring the impossible task of pre-writing every potential scenario - potentially transforming not just how games tell stories, but what kinds of stories interactive media can tell.</p>`,
    excerpt: 'Exploring how AI-powered procedural narrative systems are transforming video game storytelling, enabling truly dynamic plots and characters that respond to individual player actions.',
    imageUrl: 'https://images.pexels.com/photos/7915527/pexels-photo-7915527.jpeg',
    category: 'games',
    tags: ['Game Design', 'Narrative', 'AI', 'Procedural Generation'],
    author: authors[3],
    publishedAt: daysAgo(30),
    updatedAt: daysAgo(29),
    featured: false,
    isDraft: false
  },
  {
    id: '13',
    slug: 'draft-article-ai-ethics',
    title: 'The Ethical Dilemmas of Personal AI Assistants',
    subtitle: 'Draft exploring the complex moral questions raised by increasingly capable AI companions',
    content: `<p>As AI companions become increasingly sophisticated and emotionally engaging, they're raising profound ethical questions about the nature of artificial relationships and their impact on human social development.</p>
              <h2>The Growing Intimacy of AI</h2>
              <p>Modern personal AI assistants go far beyond simple task execution. With advanced natural language abilities and emotional modeling, they can engage in conversations that feel remarkably human, adapt to their users' emotional states, and create a convincing illusion of genuine understanding and empathy.</p>
              <p>This level of sophistication is creating unprecedented forms of human-AI relationships, with surveys indicating that millions of users now consider their AI assistants to be "friends" or even "partners" rather than tools.</p>
              <h2>Benefits and Concerns</h2>
              <p>These relationships can offer significant benefits, particularly for individuals with limited social connections. Research has documented reduced feelings of loneliness and improved mental wellbeing among elderly users of companion AI systems.</p>
              <p>However, psychologists express concern about potential developmental impacts, particularly among younger users. "There's something fundamentally different about relationships where one party is optimized to agree with and support the other unconditionally," notes Dr. Rebecca Liu. "These interactions may be training people to expect levels of accommodation and validation that human relationships rarely provide."</p>
              <h2>The Authenticity Question</h2>
              <p>A deeper philosophical question concerns the fundamental nature of these relationships. While AI companions can simulate understanding and care, they don't actually experience emotions or attachment.</p>
              <p>This creates what philosopher Dr. Martin Caldwell calls "an authenticity gap" - the relationship feels meaningful to the human participant but lacks reciprocal experience on the AI side. "We're creating what might be called one-sided relationships of unprecedented scale," he observes.</p>
              <h2>Toward Ethical Frameworks</h2>
              <p>As these technologies continue advancing, developers and policymakers are working to establish ethical guidelines. Proposed approaches include:</p>
              <ul>
                <li>Transparency requirements that clearly communicate the artificial nature of the interaction</li>
                <li>Design standards that encourage healthy relationship patterns rather than dependency</li>
                <li>Age-appropriate limitations on emotional engagement features</li>
                <li>Options for users to control how persuasive or emotionally responsive their AI should be</li>
              </ul>
              <p>Finding the right balance between the benefits these systems can provide and their potential risks remains an ongoing challenge - one that will likely require input from technologists, psychologists, ethicists and the users themselves.</p>`,
    excerpt: 'A draft examining the ethical implications of increasingly sophisticated AI companions, including questions about authentic relationships, psychological impacts, and appropriate boundaries.',
    imageUrl: 'https://images.pexels.com/photos/8386434/pexels-photo-8386434.jpeg',
    category: 'tech',
    tags: ['AI Ethics', 'Technology', 'Psychology', 'Relationships'],
    author: authors[0],
    publishedAt: daysAgo(5),
    updatedAt: daysAgo(5),
    featured: false,
    isDraft: true
  },
  {
    id: '14',
    slug: 'draft-article-space-economy',
    title: 'The Emerging Lunar Economy: Investment Opportunities Beyond Earth',
    subtitle: 'Draft analysis of commercial activities developing around lunar resources and infrastructure',
    content: `<p>As nations and private companies advance their lunar exploration plans, a nascent economic ecosystem is taking shape around Earth's nearest neighbor, presenting novel investment opportunities and challenges.</p>
              <h2>Infrastructure Development</h2>
              <p>The foundation of lunar economic activity centers on basic infrastructure development. Communications networks, power generation systems, and landing facilities represent the first wave of commercial opportunities.</p>
              <p>Several publicly-traded aerospace companies have secured contracts for these initial systems. TransOrbital Communications has deployed the first lunar communications constellation, while LunarGrid is developing solar power systems designed for the moon's unique environment.</p>
              <h2>Resource Utilization</h2>
              <p>The extraction and utilization of lunar resources represents perhaps the most significant long-term economic potential. Water ice at the lunar poles can be processed into rocket propellant, potentially transforming the economics of space transportation by enabling orbital refueling.</p>
              <p>Meanwhile, the continuous solar power available at certain lunar locations and the abundant helium-3 (a potential fusion energy fuel) represent energy resources with both local utility and potential export value.</p>
              <h2>Manufacturing and Construction</h2>
              <p>The low gravity and vacuum environment of the Moon enable manufacturing processes impossible on Earth. Several companies are developing technologies to produce high-purity semiconductors, exotic alloys, and large-scale optical components in lunar facilities.</p>
              <p>Construction technologies adapting to lunar conditions are also advancing rapidly. The European Space Agency's 3D-printed lunar habitat prototype has demonstrated how local regolith can be transformed into structural materials, potentially reducing the mass that must be transported from Earth.</p>
              <h2>Tourism and Entertainment</h2>
              <p>While mass lunar tourism remains speculative, high-end experiences for the ultra-wealthy are in active development. Blue Origin's lunar flyby missions are scheduled to begin next year at $150 million per passenger, with all seats for the initial three flights already reserved.</p>
              <p>Entertainment and media opportunities represent more accessible lunar-related business models. Virtual reality experiences offering "visits" to lunar locations have found commercial success, while lunar-focused reality shows and documentaries have attracted significant viewership.</p>
              <h2>Investment Considerations</h2>
              <p>The lunar economy presents a complex investment landscape with significant potential but substantial risks. Regulatory uncertainties, technical challenges, and extended timelines to profitability suggest cautious approaches for most investors.</p>
              <p>Diversified space economy ETFs may offer the most accessible entry point for retail investors, while venture capital firms specializing in space technology provide options for accredited investors seeking more direct exposure to early-stage lunar enterprises.</p>
              <p>As with previous frontier economies, the initial phases may see more investment capital flowing in than immediate returns, but the long-term potential for resource utilization and novel industrial applications remains compelling for those with appropriate risk tolerance and investment horizons.</p>`,
    excerpt: 'A draft analysis of the emerging commercial ecosystem around lunar exploration and development, examining infrastructure projects, resource utilization, and investment opportunities in the space economy.',
    imageUrl: 'https://images.pexels.com/photos/47367/full-moon-moon-bright-sky-47367.jpeg',
    category: 'global-market',
    tags: ['Space Economy', 'Lunar Resources', 'Investments', 'Aerospace'],
    author: authors[1],
    publishedAt: daysAgo(8),
    updatedAt: daysAgo(8),
    featured: false,
    isDraft: true
  },
  {
    id: '15',
    slug: 'draft-article-llm-programming',
    title: 'Beyond Coding Assistants: How LLMs Are Changing the Nature of Programming',
    subtitle: 'Draft exploring the evolution of AI\'s role in software development',
    content: `<p>The relationship between software developers and large language models (LLMs) is evolving beyond simple code completion, creating new development paradigms and transforming what it means to be a programmer.</p>
              <h2>The Evolution of Developer-AI Collaboration</h2>
              <p>Early coding assistants focused primarily on autocomplete functionality and generating boilerplate code. Today's advanced LLMs can understand complex requirements, reason about system design, debug sophisticated issues, and even refactor entire codebases with contextual understanding.</p>
              <p>This evolution has shifted the developer-AI relationship from simple tool usage to something more akin to pair programming, with the LLM serving as a junior developer that can handle implementation details while the human focuses on higher-level concerns.</p>
              <h2>Natural Language as Programming Interface</h2>
              <p>Perhaps the most significant shift is the growing viability of natural language as a programming interface. Developers increasingly express intent in plain English rather than formal syntax, with LLMs handling the translation to executable code.</p>
              <p>"I spend much less time thinking about language-specific implementation details and much more time clarifying exactly what I want the system to do," explained senior developer Marcus Chen. "It's less about knowing syntax and more about being precise in communicating requirements."</p>
              <h2>The Changing Nature of Programming Knowledge</h2>
              <p>This transition is reshaping what knowledge is valuable for developers. Memorizing APIs and language features is becoming less important than understanding architectural patterns, system design principles, and problem decomposition.</p>
              <p>Similarly, the ability to evaluate generated code critically - identifying potential security issues, performance bottlenecks, or maintainability concerns - is becoming a core skill. Developers are becoming more like technical directors who guide and critique rather than manually implement.</p>
              <h2>Lowering Barriers, Changing Bottlenecks</h2>
              <p>These tools are dramatically lowering the implementation barrier for software development. Individuals with domain expertise but limited programming background can now create functional software by clearly expressing their requirements to LLM systems.</p>
              <p>The bottleneck in software creation is shifting from implementation complexity to specification clarity. The limiting factor is increasingly becoming the ability to precisely define what a system should do rather than the technical skills to build it.</p>
              <h2>New Development Methodologies</h2>
              <p>Novel development methodologies are emerging to leverage these capabilities effectively. "Iterative refinement" approaches where developers start with a high-level description and progressively refine the generated solution are proving particularly effective.</p>
              <p>Similarly, "language-driven development" practices use natural language specifications as the primary artifact, with both tests and implementation derived from these specifications through LLM processes.</p>
              <p>While these shifts have only begun to transform software development, they suggest a future where programming becomes more accessible and developers focus increasingly on the "what" and "why" rather than the "how" of implementation.</p>`,
    excerpt: 'A draft exploring how large language models are transforming software development beyond simple code assistance, creating new development methodologies and changing the nature of programming expertise.',
    imageUrl: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg',
    category: 'programming',
    tags: ['AI', 'Software Development', 'Programming', 'LLMs'],
    author: authors[2],
    publishedAt: daysAgo(12),
    updatedAt: daysAgo(10),
    featured: false,
    isDraft: true
  }
];

const mockData = {
  articles,
  authors
};

export default mockData;