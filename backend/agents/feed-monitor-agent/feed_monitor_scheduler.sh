#!/bin/bash
"""
Feed Monitor Scheduler - Ejecuta el feed-monitor-agent cada 30 segundos

Este script actúa como scheduler externo para mantener el monitoreo continuo
de feeds RSS, activando el agente feed-monitor-agent de forma periódica.

Uso:
  ./feed_monitor_scheduler.sh [start|stop|status|restart]

Variables de entorno:
  MONITOR_INTERVAL: Intervalo en segundos (default: 30)
  LOG_FILE: Archivo de log (default: feed_monitor_scheduler.log)
  PID_FILE: Archivo del PID del proceso (default: feed_monitor_scheduler.pid)
"""

# Configuración
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AGENT_SCRIPT="$SCRIPT_DIR/agent_coral_compatible.py"
MONITOR_INTERVAL=${MONITOR_INTERVAL:-30}
LOG_FILE=${LOG_FILE:-"$SCRIPT_DIR/feed_monitor_scheduler.log"}
PID_FILE=${PID_FILE:-"$SCRIPT_DIR/feed_monitor_scheduler.pid"}

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
    log "INFO: $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    log "SUCCESS: $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    log "WARNING: $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    log "ERROR: $1"
}

check_agent_exists() {
    if [[ ! -f "$AGENT_SCRIPT" ]]; then
        log_error "Agent script not found: $AGENT_SCRIPT"
        exit 1
    fi
}

call_feed_monitor() {
    local command="$1"
    
    log_info "Calling feed-monitor-agent with command: $command"
    
    # Crear mensaje Coral
    local coral_message=$(cat <<EOF
{
  "sender": "scheduler",
  "receiver": "feed-monitor-agent", 
  "content": "$command"
}
EOF
    )
    
    # Ejecutar agente y capturar resultado
    local result=$(echo "$coral_message" | python3 "$AGENT_SCRIPT" 2>>"$LOG_FILE")
    local exit_code=$?
    
    if [[ $exit_code -eq 0 ]]; then
        # Parsear respuesta para obtener información útil
        local new_episodes=$(echo "$result" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    content = data.get('content', {})
    count = content.get('new_episodes_found', 0)
    print(count)
except:
    print('0')
" 2>/dev/null)
        
        if [[ "$new_episodes" -gt 0 ]]; then
            log_success "Found $new_episodes new episodes"
        else
            log_info "No new episodes found"
        fi
        
        # Log del resultado completo para debug
        echo "Agent response: $result" >> "$LOG_FILE"
    else
        log_error "Feed monitor agent failed with exit code: $exit_code"
    fi
}

monitor_loop() {
    log_info "Starting feed monitor scheduler (PID: $$, interval: ${MONITOR_INTERVAL}s)"
    echo $$ > "$PID_FILE"
    
    # Trap para cleanup
    trap 'log_info "Scheduler stopped"; rm -f "$PID_FILE"; exit 0' SIGTERM SIGINT
    
    while true; do
        call_feed_monitor "CHECK_FEEDS"
        
        log_info "Waiting $MONITOR_INTERVAL seconds until next check..."
        sleep "$MONITOR_INTERVAL"
    done
}

start_scheduler() {
    check_agent_exists
    
    if is_running; then
        log_warning "Scheduler is already running (PID: $(cat "$PID_FILE"))"
        return 1
    fi
    
    log_info "Starting feed monitor scheduler..."
    
    # Ejecutar en background
    nohup bash "$0" _internal_monitor >> "$LOG_FILE" 2>&1 &
    local pid=$!
    
    # Dar tiempo para que se inicie
    sleep 2
    
    if kill -0 "$pid" 2>/dev/null; then
        log_success "Scheduler started successfully (PID: $pid)"
        echo "$pid" > "$PID_FILE"
    else
        log_error "Failed to start scheduler"
        return 1
    fi
}

stop_scheduler() {
    if ! is_running; then
        log_warning "Scheduler is not running"
        return 1
    fi
    
    local pid=$(cat "$PID_FILE")
    log_info "Stopping scheduler (PID: $pid)..."
    
    if kill "$pid" 2>/dev/null; then
        # Esperar a que termine
        local count=0
        while kill -0 "$pid" 2>/dev/null && [[ $count -lt 10 ]]; do
            sleep 1
            ((count++))
        done
        
        if kill -0 "$pid" 2>/dev/null; then
            log_warning "Process didn't stop gracefully, forcing termination..."
            kill -9 "$pid" 2>/dev/null
        fi
        
        rm -f "$PID_FILE"
        log_success "Scheduler stopped"
    else
        log_error "Failed to stop scheduler (PID: $pid)"
        rm -f "$PID_FILE"  # Limpiar PID file si el proceso ya no existe
        return 1
    fi
}

is_running() {
    [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null
}

status_scheduler() {
    if is_running; then
        local pid=$(cat "$PID_FILE")
        log_success "Scheduler is running (PID: $pid)"
        
        # Mostrar información adicional
        echo "  Log file: $LOG_FILE"
        echo "  Agent script: $AGENT_SCRIPT"
        echo "  Check interval: ${MONITOR_INTERVAL}s"
        
        # Mostrar últimas líneas del log
        if [[ -f "$LOG_FILE" ]]; then
            echo "  Last activity:"
            tail -3 "$LOG_FILE" | sed 's/^/    /'
        fi
    else
        log_warning "Scheduler is not running"
        return 1
    fi
}

restart_scheduler() {
    log_info "Restarting scheduler..."
    stop_scheduler
    sleep 2
    start_scheduler
}

manual_check() {
    check_agent_exists
    log_info "Running manual feed check..."
    call_feed_monitor "CHECK_FEEDS"
}

show_usage() {
    cat << EOF
Feed Monitor Scheduler

Usage: $0 [command]

Commands:
    start       Start the scheduler daemon
    stop        Stop the scheduler daemon  
    restart     Restart the scheduler daemon
    status      Show scheduler status
    check       Run manual feed check (one-time)
    logs        Show recent log entries
    help        Show this help message

Configuration (environment variables):
    MONITOR_INTERVAL    Check interval in seconds (default: 30)
    LOG_FILE           Log file path (default: ./feed_monitor_scheduler.log)
    PID_FILE           PID file path (default: ./feed_monitor_scheduler.pid)

Examples:
    $0 start                    # Start monitoring every 30 seconds
    MONITOR_INTERVAL=60 $0 start   # Start monitoring every 60 seconds
    $0 check                    # Run one-time check
    $0 logs                     # Show recent activity

EOF
}

show_logs() {
    if [[ -f "$LOG_FILE" ]]; then
        echo "Recent log entries:"
        tail -20 "$LOG_FILE"
    else
        log_warning "Log file not found: $LOG_FILE"
    fi
}

# Función interna para el loop de monitoreo (llamada por nohup)
if [[ "$1" == "_internal_monitor" ]]; then
    monitor_loop
    exit 0
fi

# Procesamiento de argumentos
case "${1:-help}" in
    start)
        start_scheduler
        ;;
    stop)
        stop_scheduler
        ;;
    restart)
        restart_scheduler
        ;;
    status)
        status_scheduler
        ;;
    check)
        manual_check
        ;;
    logs)
        show_logs
        ;;
    help|--help|-h)
        show_usage
        ;;
    *)
        log_error "Unknown command: $1"
        show_usage
        exit 1
        ;;
esac