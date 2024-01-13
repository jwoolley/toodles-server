const EXPRESS_SERVER_PORT=8080;

module.exports = {
  apps : [
		{
			name: "run_toodles_server",
			script: "npm",
			args: "run server",
			ignore_watch: ["node_modules", ".git"],
			watch_delay: 1000,
   		log_date_format: "|YYYY-MM-DD|HH:mm:ss.SSS|",
			env: {
				PORT: EXPRESS_SERVER_PORT,
				DB_PATH: '/home/devuser/databases/toodles-dev.db',
				DAILY_PUZZLE_TABLE_NAME: 'daily_puzzles',
			}
		},
		{
			name: "cron_toodles_server_generate_daily_puzzle",
			script: "npm",
			args: "run generate-daily-puzzle",
			instances: 1,
			exec_mode: "fork",
			cron_restart: "0 0 * * *",
			autorestart: false,
			watch: false,
   		log_date_format: "|YYYY-MM-DD|HH:mm:ss.SSS|",
			env: {
				DB_PATH: '/home/devuser/databases/toodles-dev.db',
				DAILY_PUZZLE_TABLE_NAME: 'daily_puzzles'
			}
		}
	]
}
